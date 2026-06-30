import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Puzzle, Piece } from '../types';
import type { SolverComparisonResult, SolverResult, Move, WorkerRequest, WorkerResponse } from '../solver/types';
import { precomputeCellDistances } from '../solver/graph';
import { pieceStateFromPieces } from '../solver/state';
import { explainMove, generatePuzzleExplanation } from '../solver/explanations';
import Board from './Board';

interface Props {
  puzzle: Puzzle;
  onClose: () => void;
}

type Tab = 'summary' | 'algorithms' | 'playback' | 'learn';

function deepClone(pieces: Piece[]): Piece[] {
  return pieces.map(p => ({ ...p }));
}

/** Replay moves onto initialPieces to produce board state after `step` moves. */
function boardAtStep(initialPieces: Piece[], path: Move[], step: number): Piece[] {
  const pieces = deepClone(initialPieces);
  for (let i = 0; i < step && i < path.length; i++) {
    const { pieceColor, from, to } = path[i];
    const idx = pieces.findIndex(p => p.cell === from && p.color === pieceColor);
    if (idx >= 0) pieces[idx] = { ...pieces[idx], cell: to };
  }
  return pieces;
}

export default function SolverModal({ puzzle, onClose }: Props) {
  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [progressMsgs, setProgressMsgs] = useState<string[]>([]);
  const [currentAlg, setCurrentAlg] = useState<string>('');
  const [result, setResult] = useState<SolverComparisonResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [tab, setTab] = useState<Tab>('summary');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms per step
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const workerRef = useRef<Worker | null>(null);

  // Launch worker on mount
  useEffect(() => {
    const worker = new Worker(
      new URL('../solver/worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        setProgressMsgs(prev => [...prev, msg.message]);
        if (msg.algorithm) setCurrentAlg(msg.algorithm);
      } else if (msg.type === 'result') {
        setResult(msg.result);
        setPhase('done');
      } else if (msg.type === 'error') {
        setErrorMsg(msg.message);
        setPhase('error');
      }
    };

    const req: WorkerRequest = {
      type: 'solve',
      cells: puzzle.cells,
      initialPieces: puzzle.initialPieces,
      goalPieces: puzzle.goalPieces,
      options: { withTurns: puzzle.mode === 'with-turns' },
    };
    worker.postMessage(req);

    return () => { worker.terminate(); };
  }, [puzzle]);

  // Auto-play logic
  useEffect(() => {
    if (!playing) return;
    const path = result?.bestResult?.path ?? [];
    if (step >= path.length) { setPlaying(false); return; }
    playTimerRef.current = setTimeout(() => setStep(s => s + 1), speed);
    return () => { if (playTimerRef.current) clearTimeout(playTimerRef.current); };
  }, [playing, step, speed, result]);

  const stopPlay = useCallback(() => {
    setPlaying(false);
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
  }, []);

  const togglePlay = () => {
    if (playing) { stopPlay(); return; }
    const path = result?.bestResult?.path ?? [];
    if (step >= path.length) setStep(0);
    setPlaying(true);
  };

  // Prevent clicks inside modal from closing it
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const path = result?.bestResult?.path ?? [];
  const currentPieces = boardAtStep(puzzle.initialPieces, path, step);

  // Precompute distances once (fast for small boards)
  const distances = React.useMemo(
    () => precomputeCellDistances(puzzle.cells),
    [puzzle.cells]
  );

  // Per-move explanation
  const moveExplanation = React.useMemo(() => {
    if (!result?.bestResult?.solvable || step === 0 || step > path.length) return '';
    const move = path[step - 1];
    if (!move) return '';
    try {
      const beforePieces = boardAtStep(puzzle.initialPieces, path, step - 1);
      const afterPieces  = boardAtStep(puzzle.initialPieces, path, step);
      const beforeState = pieceStateFromPieces(beforePieces, puzzle.mode === 'with-turns');
      const afterState  = pieceStateFromPieces(afterPieces,  puzzle.mode === 'with-turns');
      return explainMove(move, beforeState, afterState, puzzle.goalPieces, distances, step - 1);
    } catch {
      return `${move.pieceColor === 'white' ? '♘ White' : '♞ Black'} knight: ${move.from} → ${move.to}`;
    }
  }, [step, path, puzzle, result, distances]);

  const conceptLines = React.useMemo(() => {
    if (!result) return [];
    return generatePuzzleExplanation(
      puzzle.mode === 'with-turns',
      result.solvable,
      result.reachableStates ?? 0,
      result.bestMovesCount
    );
  }, [result, puzzle]);

  return (
    <div
      className="modal-overlay"
      style={{ alignItems: 'flex-start', overflowY: 'auto', padding: '24px 12px' }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{ width: '100%', maxWidth: 880, margin: '0 auto', padding: 0 }}
        onClick={stopPropagation}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '3px solid var(--border)',
          background: 'var(--panel-dark)',
        }}>
          <div style={{ fontSize: 10, color: '#fff', textShadow: '2px 2px 0 #000' }}>
            Solver Analysis: {puzzle.name}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--red)', border: '2px solid var(--border)',
              color: '#fff', fontFamily: 'inherit', fontSize: 10,
              padding: '6px 10px', cursor: 'pointer',
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Loading phase */}
        {phase === 'loading' && (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 11, marginBottom: 16, color: 'var(--yellow)' }}>
              Running Solver Engine...
            </div>
            {currentAlg && (
              <div style={{ fontSize: 9, color: 'var(--text-dim)', marginBottom: 12 }}>
                Currently: {currentAlg}
              </div>
            )}
            <div style={{ fontSize: 8, color: 'var(--text-dim)', lineHeight: 2 }}>
              {progressMsgs.slice(-4).map((m, i) => (
                <div key={i}>{m}</div>
              ))}
            </div>
          </div>
        )}

        {/* Error phase */}
        {phase === 'error' && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--red)', fontSize: 9 }}>
            <div style={{ marginBottom: 12 }}>Solver error:</div>
            <div style={{ color: 'var(--text-dim)' }}>{errorMsg}</div>
          </div>
        )}

        {/* Results phase */}
        {phase === 'done' && result && (
          <>
            {/* Tabs */}
            <div style={{
              display: 'flex', borderBottom: '3px solid var(--border)',
              background: 'var(--bg-dark)',
            }}>
              {(['summary', 'algorithms', 'playback', 'learn'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); stopPlay(); }}
                  style={{
                    fontFamily: 'inherit', fontSize: 8, padding: '10px 14px',
                    background: tab === t ? 'var(--panel)' : 'transparent',
                    border: 'none', borderRight: '2px solid var(--border)',
                    color: tab === t ? '#fff' : 'var(--text-dim)',
                    cursor: 'pointer', textTransform: 'capitalize',
                  }}
                >
                  {t === 'algorithms' ? 'All Algorithms' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ padding: 20 }}>

              {/* SUMMARY TAB */}
              {tab === 'summary' && (
                <SummaryTab result={result} />
              )}

              {/* ALGORITHMS TAB */}
              {tab === 'algorithms' && (
                <AlgorithmsTab results={result.allResults} />
              )}

              {/* PLAYBACK TAB */}
              {tab === 'playback' && (
                <PlaybackTab
                  puzzle={puzzle}
                  result={result}
                  step={step}
                  setStep={setStep}
                  playing={playing}
                  togglePlay={togglePlay}
                  speed={speed}
                  setSpeed={setSpeed}
                  currentPieces={currentPieces}
                  moveExplanation={moveExplanation}
                  path={path}
                />
              )}

              {/* LEARN TAB */}
              {tab === 'learn' && (
                <LearnTab lines={conceptLines} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────── Sub-components ── */

function SummaryTab({ result }: { result: SolverComparisonResult }) {
  const solvable = result.solvable;
  const bestResult = result.bestResult;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Solvable badge */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: solvable ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
          border: `3px solid ${solvable ? 'var(--green)' : 'var(--red)'}`,
          fontSize: 13,
          color: solvable ? 'var(--green)' : 'var(--red)',
        }}>
          {solvable ? '✓ SOLVABLE' : '✗ IMPOSSIBLE'}
        </div>
      </div>

      {solvable && bestResult && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
        }}>
          {[
            { label: 'Optimal Moves', value: bestResult.movesCount ?? '—' },
            { label: 'Best Algorithm', value: bestResult.algorithm },
            { label: 'Solve Time', value: `${bestResult.timeMs.toFixed(1)}ms` },
          ].map(({ label, value }) => (
            <div key={label} className="panel" style={{ padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 7, color: 'var(--text-dim)', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--yellow)' }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Explanation */}
      <div className="panel" style={{ padding: 14, background: 'var(--bg-dark)' }}>
        <div style={{ fontSize: 8, color: 'var(--text-dim)', lineHeight: 2.2 }}>
          {solvable && bestResult
            ? bestResult.explanation
            : (result.impossibilityExplanation ?? 'No solution exists.')}
        </div>
      </div>

      {/* Reachable states */}
      {result.reachableStates !== undefined && (
        <div style={{ fontSize: 8, color: 'var(--text-dim)', textAlign: 'center' }}>
          Total reachable states explored by BFS: {result.reachableStates.toLocaleString()}
        </div>
      )}
    </div>
  );
}

function AlgorithmsTab({ results }: { results: SolverResult[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse', fontSize: 8,
      }}>
        <thead>
          <tr style={{ background: 'var(--bg-dark)' }}>
            {['Algorithm', 'Solvable', 'Optimal', 'Moves', 'States Visited', 'States Expanded', 'Time (ms)'].map(h => (
              <th key={h} style={{
                padding: '8px 10px', border: '2px solid var(--border)',
                color: 'var(--text-dim)', fontWeight: 'normal', textAlign: 'left',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map(r => (
            <tr key={r.algorithm} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 10px', border: '1px solid var(--border)', color: 'var(--yellow)' }}>
                {r.algorithm}
              </td>
              <td style={{ padding: '8px 10px', border: '1px solid var(--border)',
                color: r.solvable ? 'var(--green)' : 'var(--red)' }}>
                {r.solvable ? '✓' : r.timedOut ? 'Timeout' : '✗'}
              </td>
              <td style={{ padding: '8px 10px', border: '1px solid var(--border)',
                color: r.optimal ? 'var(--green)' : 'var(--text-dim)' }}>
                {r.optimal ? '✓' : '✗'}
              </td>
              <td style={{ padding: '8px 10px', border: '1px solid var(--border)' }}>
                {r.movesCount ?? '—'}
              </td>
              <td style={{ padding: '8px 10px', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                {r.visitedStates.toLocaleString()}
              </td>
              <td style={{ padding: '8px 10px', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                {r.expandedStates.toLocaleString()}
              </td>
              <td style={{ padding: '8px 10px', border: '1px solid var(--border)' }}>
                {r.timeMs.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Per-algorithm explanations */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {results.map(r => (
          <details key={r.algorithm}>
            <summary style={{ cursor: 'pointer', fontSize: 9, color: 'var(--yellow)', padding: 6 }}>
              {r.algorithm} — explanation
            </summary>
            <div style={{ padding: '8px 12px', fontSize: 8, color: 'var(--text-dim)', lineHeight: 2.2, background: 'var(--bg-dark)' }}>
              {r.explanation}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

interface PlaybackProps {
  puzzle: Puzzle;
  result: SolverComparisonResult;
  step: number;
  setStep: (s: number | ((prev: number) => number)) => void;
  playing: boolean;
  togglePlay: () => void;
  speed: number;
  setSpeed: (s: number) => void;
  currentPieces: Piece[];
  moveExplanation: string;
  path: Move[];
}

function PlaybackTab({
  puzzle, result, step, setStep, playing, togglePlay,
  speed, setSpeed, currentPieces, moveExplanation, path,
}: PlaybackProps) {
  if (!result.solvable || !result.bestResult?.path.length) {
    return (
      <div style={{ textAlign: 'center', padding: 32, fontSize: 9, color: 'var(--text-dim)' }}>
        {result.solvable
          ? 'No solution path to display.'
          : 'This puzzle has no solution — playback unavailable.'}
      </div>
    );
  }

  const totalSteps = path.length;
  const currentMove = step > 0 ? path[step - 1] : null;

  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
      {/* Board */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Board
          cells={puzzle.cells}
          pieces={currentPieces}
          goalPieces={puzzle.goalPieces}
          size="medium"
        />

        {/* Step counter */}
        <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>
          Step{' '}
          <span style={{ color: 'var(--yellow)' }}>{step}</span>
          {' / '}
          {totalSteps}
          {step === totalSteps && (
            <span style={{ color: 'var(--green)', marginLeft: 8 }}>Goal!</span>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="pixel-btn"
            style={{ fontSize: 8, padding: '6px 10px' }}
            onClick={() => { setStep((s: number) => Math.max(0, s - 1)); }}
            disabled={step === 0}
          >
            ◀ Prev
          </button>
          <button
            className="pixel-btn"
            style={{ fontSize: 8, padding: '6px 10px',
              background: playing ? 'var(--red)' : 'var(--btn-bg)' }}
            onClick={togglePlay}
            disabled={step >= totalSteps && !playing}
          >
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            className="pixel-btn"
            style={{ fontSize: 8, padding: '6px 10px' }}
            onClick={() => { setStep((s: number) => Math.min(totalSteps, s + 1)); }}
            disabled={step >= totalSteps}
          >
            Next ▶
          </button>
          <button
            className="pixel-btn"
            style={{ fontSize: 8, padding: '6px 8px' }}
            onClick={() => setStep(0)}
          >
            ↩ Reset
          </button>
        </div>

        {/* Speed */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 7, color: 'var(--text-dim)' }}>Speed:</span>
          {[['Slow', 2000], ['Normal', 1000], ['Fast', 400]] .map(([label, ms]) => (
            <button
              key={label}
              className="pixel-btn"
              style={{ fontSize: 7, padding: '4px 8px',
                background: speed === ms ? 'var(--btn-hover)' : 'var(--btn-bg)' }}
              onClick={() => setSpeed(ms as number)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation panel */}
      <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Current move */}
        {currentMove && (
          <div className="panel" style={{ padding: 12, background: 'var(--bg-dark)' }}>
            <div style={{ fontSize: 8, color: 'var(--yellow)', marginBottom: 6 }}>
              {currentMove.pieceColor === 'white' ? '♘ White' : '♞ Black'} knight moved:{' '}
              {currentMove.from} → {currentMove.to}
            </div>
            <div style={{ fontSize: 8, color: 'var(--text-dim)', lineHeight: 2.2 }}>
              {moveExplanation || 'Select a step to see explanation.'}
            </div>
          </div>
        )}
        {!currentMove && (
          <div style={{ fontSize: 8, color: 'var(--text-dim)', padding: 8 }}>
            Initial position. Press Play or Next to start.
          </div>
        )}

        {/* Move list */}
        <div className="panel" style={{ padding: 10, flex: 1 }}>
          <div style={{ fontSize: 8, color: 'var(--text-dim)', marginBottom: 6, borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
            All Moves ({totalSteps})
          </div>
          <div style={{ fontSize: 8, overflowY: 'auto', maxHeight: 260, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {path.map((m, i) => (
              <div
                key={i}
                onClick={() => setStep(i + 1)}
                style={{
                  cursor: 'pointer', padding: '3px 6px',
                  background: step === i + 1 ? 'rgba(251,191,36,0.2)' : 'transparent',
                  borderLeft: step === i + 1 ? '3px solid var(--yellow)' : '3px solid transparent',
                  color: step === i + 1 ? 'var(--text)' : 'var(--text-dim)',
                }}
              >
                {i + 1}. {m.pieceColor === 'white' ? '♘' : '♞'} {m.from} → {m.to}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LearnTab({ lines }: { lines: string[] }) {
  // Lines come in pairs: [title, body, title, body, ...]
  const sections: Array<{ title: string; body: string }> = [];
  for (let i = 0; i < lines.length - 1; i += 2) {
    sections.push({ title: lines[i], body: lines[i + 1] });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sections.map(({ title, body }) => (
        <details key={title} style={{ borderBottom: '1px solid var(--border)' }}>
          <summary style={{
            cursor: 'pointer', fontSize: 9, padding: '10px 6px',
            color: 'var(--yellow)', userSelect: 'none',
          }}>
            {title}
          </summary>
          <div style={{
            fontSize: 8, color: 'var(--text-dim)', lineHeight: 2.4,
            padding: '8px 12px 12px', background: 'var(--bg-dark)',
          }}>
            {body}
          </div>
        </details>
      ))}
    </div>
  );
}
