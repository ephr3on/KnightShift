import { useState } from 'react';
import type { Puzzle, PuzzleMode } from '../types';
import { PUZZLES_NO_TURN, PUZZLES_WITH_TURN } from '../puzzles';
import Board from './Board';
import PixelButton from './PixelButton';

interface Props {
  onPlay: (puzzle: Puzzle) => void;
  onBack: () => void;
  initialMode?: PuzzleMode;
}

function diffClass(d: string) {
  const map: Record<string, string> = {
    Easy: 'diff-easy',
    Medium: 'diff-medium',
    Hard: 'diff-hard',
    'Very Hard': 'diff-veryhard',
    Genius: 'diff-genius',
    Original: 'diff-original',
  };
  return map[d] ?? '';
}

function getBest(id: string): number | null {
  const v = localStorage.getItem(`best_${id}`);
  return v ? parseInt(v) : null;
}

export default function PuzzleSelect({ onPlay, onBack, initialMode = 'no-turns' }: Props) {
  const [mode, setMode] = useState<PuzzleMode>(initialMode);
  const puzzles = mode === 'no-turns' ? PUZZLES_NO_TURN : PUZZLES_WITH_TURN;

  return (
    <div className="select-screen">
      <h1 className="select-title">
        {mode === 'no-turns' ? 'Puzzles (No Turn)' : 'Puzzles (With Turn)'}
      </h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <PixelButton
          onClick={() => setMode('no-turns')}
          style={{ opacity: mode === 'no-turns' ? 1 : 0.6 }}
        >
          No Turn
        </PixelButton>
        <PixelButton
          onClick={() => setMode('with-turns')}
          style={{ opacity: mode === 'with-turns' ? 1 : 0.6 }}
        >
          With Turn
        </PixelButton>
      </div>

      <div className="puzzle-cards">
        {puzzles.map(puzzle => {
          const best = getBest(puzzle.id);
          const displayMoves = puzzle.optimalMoves > 0 ? puzzle.optimalMoves : '?';
          return (
            <div key={puzzle.id} className="panel puzzle-card">
              <div className="card-name">{puzzle.name}</div>

              <div className="card-board-preview">
                <Board
                  cells={puzzle.cells}
                  pieces={puzzle.initialPieces}
                  goalPieces={puzzle.goalPieces}
                  size="tiny"
                />
              </div>

              <div className={`card-difficulty ${diffClass(puzzle.difficulty)}`}>
                {puzzle.difficulty}
              </div>

              <div className="card-stats">
                Optimal: {displayMoves} moves<br />
                Best: {best !== null ? best : '-'}
              </div>

              <PixelButton
                className="card-play-btn"
                onClick={() => onPlay(puzzle)}
              >
                Play
              </PixelButton>
            </div>
          );
        })}
      </div>

      <div className="select-bottom">
        <PixelButton onClick={onBack}>&lt;- Back</PixelButton>
      </div>
    </div>
  );
}
