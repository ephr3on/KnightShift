import { useState, useRef, useEffect, useCallback } from 'react';
import type { Puzzle, PuzzleMode, SavedPuzzleEntry } from '../types';
import type { Difficulty } from '../generator/difficulty';
import type { BoardSize } from '../generator/boardGenerator';
import type { GeneratorWorkerRequest, GeneratorWorkerResponse } from '../workers/generatorWorker';
import type { GeneratorResult } from '../generator/puzzleGenerator';
import { ALL_DIFFICULTIES } from '../generator/difficulty';
import { BOARD_SIZE_CONFIG } from '../generator/boardGenerator';
import { generateSeedString } from '../generator/seed';
import { encodePuzzleCode } from '../generator/puzzleGenerator';
import { savePuzzle, isSaved } from '../storage';
import Board from './Board';
import PixelButton from './PixelButton';
import SolverModal from './SolverModal';
import ScreenHeader from './ScreenHeader';

interface Props {
  onPlay: (puzzle: Puzzle) => void;
  onBack: () => void;
}

type Phase = 'config' | 'generating' | 'preview' | 'error';

const BOARD_SIZES: BoardSize[] = ['small', 'classic', 'medium', 'large'];

function diffClass(d: string) {
  const map: Record<string, string> = {
    Easy: 'diff-easy', Medium: 'diff-medium', Hard: 'diff-hard',
    'Very Hard': 'diff-veryhard', Genius: 'diff-genius',
  };
  return map[d] ?? '';
}

export default function UnlimitedMode({ onPlay, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('config');
  const [mode, setMode] = useState<PuzzleMode>('no-turns');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [boardSize, setBoardSize] = useState<BoardSize>('classic');
  const [seed, setSeed] = useState(generateSeedString());
  const [customSeed, setCustomSeed] = useState('');
  const [useCustomSeed, setUseCustomSeed] = useState(false);
  const [progressMsgs, setProgressMsgs] = useState<string[]>([]);
  const [progressDetail, setProgressDetail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<GeneratorResult | null>(null);
  const [showSolver, setShowSolver] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [copiedMsg, setCopiedMsg] = useState('');
  const workerRef = useRef<Worker | null>(null);

  const activeSeed = useCustomSeed && customSeed.trim() ? customSeed.trim() : seed;
  const generatedPuzzle = result?.type === 'success' ? result.puzzle : null;

  const terminate = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  useEffect(() => () => terminate(), [terminate]);

  const handleGenerate = () => {
    terminate();
    setPhase('generating');
    setProgressMsgs([]);
    setProgressDetail('');
    setResult(null);
    setErrorMsg('');
    setSavedMsg('');
    setCopiedMsg('');

    const worker = new Worker(
      new URL('../workers/generatorWorker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<GeneratorWorkerResponse>) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        setProgressMsgs(prev => {
          const next = [...prev, msg.message];
          return next.slice(-4);
        });
        setProgressDetail(`Attempt ${msg.attempt} / ${msg.maxAttempts}`);
      } else if (msg.type === 'result') {
        setResult(msg.result);
        setPhase(msg.result.type === 'success' ? 'preview' : 'error');
        if (msg.result.type === 'failure') {
          setErrorMsg(msg.result.reason);
        }
        // Refresh seed for next time
        if (!useCustomSeed) setSeed(generateSeedString());
      } else if (msg.type === 'error') {
        setErrorMsg(msg.message);
        setPhase('error');
      }
    };

    const req: GeneratorWorkerRequest = {
      type: 'generate',
      options: { mode, difficulty, boardSize, seed: activeSeed, maxAttempts: 800, maxTimeMs: 14000 },
    };
    worker.postMessage(req);
  };

  const handleSave = () => {
    if (!generatedPuzzle || result?.type !== 'success') return;
    const whiteCells = generatedPuzzle.initialPieces.filter(p => p.color === 'white').map(p => p.cell);
    const blackCells = generatedPuzzle.initialPieces.filter(p => p.color === 'black').map(p => p.cell);
    const code = encodePuzzleCode(
      generatedPuzzle.cells, whiteCells, blackCells,
      generatedPuzzle.mode, result.seed, result.optimalMoves
    );
    const entry: SavedPuzzleEntry = {
      id: generatedPuzzle.id,
      puzzleId: generatedPuzzle.id,
      name: generatedPuzzle.name,
      seed: result.seed,
      mode: generatedPuzzle.mode,
      difficulty: generatedPuzzle.difficulty,
      optimalMoves: result.optimalMoves,
      dateGenerated: new Date().toISOString(),
      dateSaved: new Date().toISOString(),
      puzzleCode: code,
      puzzle: generatedPuzzle,
    };
    savePuzzle(entry);
    setSavedMsg('Saved!');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  const handleCopyCode = () => {
    if (!generatedPuzzle || result?.type !== 'success') return;
    const whiteCells = generatedPuzzle.initialPieces.filter(p => p.color === 'white').map(p => p.cell);
    const blackCells = generatedPuzzle.initialPieces.filter(p => p.color === 'black').map(p => p.cell);
    const code = encodePuzzleCode(
      generatedPuzzle.cells, whiteCells, blackCells,
      generatedPuzzle.mode, result.seed, result.optimalMoves
    );
    navigator.clipboard.writeText(code).then(() => {
      setCopiedMsg('Copied!');
      setTimeout(() => setCopiedMsg(''), 2000);
    });
  };

  const handleCopySeed = () => {
    if (result?.type !== 'success') return;
    navigator.clipboard.writeText(result.seed).then(() => {
      setCopiedMsg('Seed copied!');
      setTimeout(() => setCopiedMsg(''), 2000);
    });
  };

  return (
    <div className="unlimited-screen">
      <ScreenHeader
        title="Custom Puzzle"
        onBack={onBack}
        backLabel="Menu"
      />

      <div className="unlimited-layout">
        {/* Config panel */}
        <div className="panel unlimited-config">
          <div className="panel-title">Custom Builder</div>

          <div className="gen-section">
            <div className="gen-label">Mode</div>
            <div className="gen-options">
              {(['no-turns', 'with-turns'] as PuzzleMode[]).map(m => (
                <button
                  key={m}
                  className={`gen-option-btn${mode === m ? ' active' : ''}`}
                  onClick={() => setMode(m)}
                >
                  {m === 'no-turns' ? 'No Turns' : 'With Turns'}
                </button>
              ))}
            </div>
          </div>

          <div className="gen-section">
            <div className="gen-label">Difficulty</div>
            <div className="gen-options" style={{ flexWrap: 'wrap' }}>
              {ALL_DIFFICULTIES.map(d => (
                <button
                  key={d}
                  className={`gen-option-btn ${diffClass(d)}${difficulty === d ? ' active' : ''}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="gen-section">
            <div className="gen-label">Board Size</div>
            <div className="gen-options">
              {BOARD_SIZES.map(s => (
                <button
                  key={s}
                  className={`gen-option-btn${boardSize === s ? ' active' : ''}`}
                  onClick={() => setBoardSize(s)}
                >
                  {BOARD_SIZE_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          <div className="gen-section">
            <div className="gen-label">Seed</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="use-custom-seed"
                  checked={useCustomSeed}
                  onChange={e => setUseCustomSeed(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="use-custom-seed" className="gen-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Custom seed
                </label>
              </div>
              {useCustomSeed ? (
                <input
                  className="gen-seed-input"
                  value={customSeed}
                  onChange={e => setCustomSeed(e.target.value)}
                  placeholder="Enter seed…"
                />
              ) : (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="gen-seed-display">{seed}</span>
                  <button
                    className="gen-option-btn"
                    onClick={() => setSeed(generateSeedString())}
                    style={{ fontSize: 8, padding: '4px 8px' }}
                  >
                    ↺
                  </button>
                </div>
              )}
            </div>
          </div>

          <PixelButton
            variant="primary"
            onClick={handleGenerate}
            disabled={phase === 'generating'}
            style={{ width: '100%', marginTop: 8 }}
          >
            {phase === 'generating' ? 'Generating…' : 'Generate Custom Puzzle'}
          </PixelButton>
        </div>

        {/* Right panel: loading / preview / error */}
        <div className="unlimited-preview">
          {phase === 'config' && (
            <div className="gen-placeholder">
              <div style={{ fontSize: 24, marginBottom: 12 }}>♞</div>
              <div style={{ fontSize: 9, color: 'var(--text-dim)', textAlign: 'center', lineHeight: 2 }}>
                Choose difficulty, board size,<br />then generate a custom puzzle.
              </div>
            </div>
          )}

          {phase === 'generating' && (
            <div className="gen-loading">
              <div className="gen-spinner">♞</div>
              <div style={{ fontSize: 10, color: 'var(--yellow)', marginBottom: 12 }}>
                {progressMsgs[progressMsgs.length - 1] || 'Starting…'}
              </div>
              <div style={{ fontSize: 8, color: 'var(--text-dim)', marginBottom: 8 }}>
                {progressDetail}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {progressMsgs.slice(-3).map((m, i) => (
                  <div key={i} style={{ fontSize: 7, color: 'var(--text-dim)', opacity: 0.6 + i * 0.2 }}>
                    {m}
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === 'error' && (
            <div className="gen-error">
              <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 12 }}>Generation Failed</div>
              <div style={{ fontSize: 8, color: 'var(--text-dim)', lineHeight: 2, marginBottom: 16, textAlign: 'center' }}>
                {errorMsg}
              </div>
              <PixelButton variant="primary" onClick={handleGenerate}>Try Again</PixelButton>
            </div>
          )}

          {phase === 'preview' && generatedPuzzle && result?.type === 'success' && (
            <div className="gen-preview-card panel">
              <div className="gen-preview-name">{generatedPuzzle.name}</div>

              <div className={`card-difficulty ${diffClass(generatedPuzzle.difficulty)}`} style={{ fontSize: 9, marginBottom: 8 }}>
                {generatedPuzzle.difficulty}
              </div>

              <div style={{ fontSize: 8, color: 'var(--text-dim)', marginBottom: 12, lineHeight: 2 }}>
                Mode: {generatedPuzzle.mode === 'no-turns' ? 'No Turns' : 'With Turns'}<br />
                Optimal moves: <span style={{ color: 'var(--yellow)' }}>{result.optimalMoves}</span><br />
                Cells: {generatedPuzzle.cells.length}<br />
                Seed: <span style={{ color: 'var(--text-dim)', fontSize: 7 }}>{result.seed}</span>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 7, color: 'var(--text-dim)', textAlign: 'center', marginBottom: 4 }}>Start</div>
                  <Board
                    cells={generatedPuzzle.cells}
                    pieces={generatedPuzzle.initialPieces}
                    goalPieces={generatedPuzzle.goalPieces}
                    size="small"
                  />
                </div>
                <div>
                  <div style={{ fontSize: 7, color: 'var(--text-dim)', textAlign: 'center', marginBottom: 4 }}>Goal</div>
                  <Board
                    cells={generatedPuzzle.cells}
                    pieces={generatedPuzzle.goalPieces.flatMap((g, gi) =>
                      g.cells.map((cell, ci) => ({ id: `g-${gi}-${ci}`, color: g.color, cell }))
                    )}
                    size="small"
                  />
                </div>
              </div>

              <div className="gen-action-btns">
                <PixelButton variant="primary" onClick={() => onPlay(generatedPuzzle)}>
                  Play
                </PixelButton>
                <PixelButton variant="secondary" onClick={() => setShowSolver(true)}>
                  Solution
                </PixelButton>
                <PixelButton
                  onClick={handleSave}
                  disabled={isSaved(generatedPuzzle.id)}
                  className="btn-compact"
                  variant="ghost"
                >
                  {savedMsg || (isSaved(generatedPuzzle.id) ? 'Saved ✓' : 'Save')}
                </PixelButton>
                <PixelButton variant="ghost" className="btn-compact" onClick={handleCopyCode}>
                  {copiedMsg || 'Code'}
                </PixelButton>
                <PixelButton variant="ghost" className="btn-compact" onClick={handleCopySeed}>
                  Seed
                </PixelButton>
                <PixelButton variant="secondary" className="btn-compact" onClick={handleGenerate}>
                  Generate Again
                </PixelButton>
              </div>

              {(savedMsg || copiedMsg) && (
                <div style={{ fontSize: 8, color: 'var(--green)', textAlign: 'center', marginTop: 6 }}>
                  {savedMsg || copiedMsg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showSolver && generatedPuzzle && (
        <SolverModal puzzle={generatedPuzzle} onClose={() => setShowSolver(false)} />
      )}
    </div>
  );
}

export function useDailyGen(
  mode: PuzzleMode,
  dailySeed: string,
  date: string,
  cachedPuzzle: Puzzle | null,
  onResult: (puzzle: Puzzle | null, error: string) => void
) {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (cachedPuzzle) return;

    const worker = new Worker(
      new URL('../workers/generatorWorker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<GeneratorWorkerResponse>) => {
      const msg = e.data;
      if (msg.type === 'result') {
        if (msg.result.type === 'success') {
          onResult(msg.result.puzzle, '');
        } else {
          onResult(null, msg.result.reason);
        }
      } else if (msg.type === 'error') {
        onResult(null, msg.message);
      }
    };

    const req: GeneratorWorkerRequest = {
      type: 'generate',
      options: {
        mode,
        difficulty: 'Medium',
        boardSize: 'classic',
        seed: `${dailySeed}-${date}`,
        maxAttempts: 800,
        maxTimeMs: 14000,
      },
    };
    worker.postMessage(req);

    return () => { worker.terminate(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, dailySeed, date]);

  return workerRef;
}
