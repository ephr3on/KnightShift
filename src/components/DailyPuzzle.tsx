import { useState, useEffect, useRef } from 'react';
import type { Puzzle, PuzzleMode } from '../types';
import type { GeneratorWorkerRequest, GeneratorWorkerResponse } from '../workers/generatorWorker';
import { getDailySeed, getTodayString } from '../generator/seed';
import { getCachedDailyPuzzle, cacheDailyPuzzle, getDailyResult } from '../storage';
import Board from './Board';
import PixelButton from './PixelButton';

interface Props {
  onPlay: (puzzle: Puzzle) => void;
  onBack: () => void;
}

type Status = 'idle' | 'generating' | 'ready' | 'error';

interface DailySlot {
  mode: PuzzleMode;
  label: string;
  puzzle: Puzzle | null;
  status: Status;
  error: string;
  generating: boolean;
}

function diffClass(d: string) {
  const map: Record<string, string> = {
    Easy: 'diff-easy', Medium: 'diff-medium', Hard: 'diff-hard',
    'Very Hard': 'diff-veryhard', Genius: 'diff-genius',
  };
  return map[d] ?? '';
}

export default function DailyPuzzle({ onPlay, onBack }: Props) {
  const today = getTodayString();
  const [slots, setSlots] = useState<DailySlot[]>([
    { mode: 'no-turns',   label: 'No Turns',   puzzle: null, status: 'idle', error: '', generating: false },
    { mode: 'with-turns', label: 'With Turns', puzzle: null, status: 'idle', error: '', generating: false },
  ]);
  const workersRef = useRef<Record<string, Worker | null>>({});

  // On mount, load cached puzzles or generate them
  useEffect(() => {
    for (const mode of ['no-turns', 'with-turns'] as PuzzleMode[]) {
      const cached = getCachedDailyPuzzle(today, mode);
      if (cached) {
        setSlots(prev => prev.map(s =>
          s.mode === mode ? { ...s, puzzle: cached, status: 'ready' } : s
        ));
      } else {
        startGeneration(mode);
      }
    }
    return () => {
      for (const w of Object.values(workersRef.current)) w?.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startGeneration(mode: PuzzleMode) {
    setSlots(prev => prev.map(s =>
      s.mode === mode ? { ...s, status: 'generating', generating: true, error: '' } : s
    ));

    const worker = new Worker(
      new URL('../workers/generatorWorker.ts', import.meta.url),
      { type: 'module' }
    );
    workersRef.current[mode] = worker;

    worker.onmessage = (e: MessageEvent<GeneratorWorkerResponse>) => {
      const msg = e.data;
      if (msg.type === 'result') {
        if (msg.result.type === 'success') {
          const p = msg.result.puzzle;
          cacheDailyPuzzle(today, mode, p);
          setSlots(prev => prev.map(s =>
            s.mode === mode ? { ...s, puzzle: p, status: 'ready', generating: false } : s
          ));
        } else {
          setSlots(prev => prev.map(s =>
            s.mode === mode
              ? { ...s, status: 'error', error: msg.result.type === 'failure' ? msg.result.reason : 'Error', generating: false }
              : s
          ));
        }
      } else if (msg.type === 'error') {
        setSlots(prev => prev.map(s =>
          s.mode === mode ? { ...s, status: 'error', error: msg.message, generating: false } : s
        ));
      }
    };

    const req: GeneratorWorkerRequest = {
      type: 'generate',
      options: {
        mode,
        difficulty: 'Medium',
        boardSize: 'classic',
        seed: getDailySeed(mode),
        maxAttempts: 800,
        maxTimeMs: 14000,
      },
    };
    worker.postMessage(req);
  }

  return (
    <div className="select-screen">
      <h1 className="select-title">Daily Puzzle</h1>
      <div style={{ fontSize: 8, color: 'var(--text-dim)', marginBottom: 24 }}>
        {today} — same puzzle for everyone today
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 700 }}>
        {slots.map(slot => {
          const result = getDailyResult(today, slot.mode);
          return (
            <div key={slot.mode} className="panel daily-slot">
              <div className="daily-slot-title">{slot.label}</div>
              <div style={{ fontSize: 8, color: 'var(--text-dim)', marginBottom: 12 }}>Daily — {today}</div>

              {slot.status === 'generating' && (
                <div className="gen-loading" style={{ gap: 8, padding: 16 }}>
                  <div className="gen-spinner" style={{ fontSize: 20 }}>♞</div>
                  <div style={{ fontSize: 8, color: 'var(--yellow)' }}>Generating today's puzzle…</div>
                </div>
              )}

              {slot.status === 'error' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: 'var(--red)', marginBottom: 8 }}>Generation failed</div>
                  <PixelButton variant="secondary" className="btn-compact" onClick={() => startGeneration(slot.mode)}>
                    Retry
                  </PixelButton>
                </div>
              )}

              {slot.status === 'ready' && slot.puzzle && (
                <>
                  <div className={`card-difficulty ${diffClass(slot.puzzle.difficulty)}`} style={{ marginBottom: 8 }}>
                    {slot.puzzle.difficulty}
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <Board cells={slot.puzzle.cells} pieces={slot.puzzle.initialPieces} size="small" />
                  </div>
                  <div style={{ fontSize: 7, color: 'var(--text-dim)', lineHeight: 2, marginBottom: 10, textAlign: 'center' }}>
                    Optimal: {slot.puzzle.optimalMoves} moves
                    {result && (
                      <><br />Your best: <span style={{ color: result.completed ? 'var(--green)' : 'var(--text)' }}>
                        {result.movesMade} moves {result.completed ? '✓' : ''}
                      </span></>
                    )}
                  </div>
                  <PixelButton variant="primary" onClick={() => onPlay(slot.puzzle!)} style={{ width: '100%' }}>
                    {result?.completed ? 'Play Again' : 'Play'}
                  </PixelButton>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="select-bottom">
        <PixelButton variant="ghost" onClick={onBack}>← Back</PixelButton>
      </div>
    </div>
  );
}
