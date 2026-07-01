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
          variant={mode === 'no-turns' ? 'primary' : 'ghost'}
          className="segmented-control-btn"
          onClick={() => setMode('no-turns')}
        >
          No Turn
        </PixelButton>
        <PixelButton
          variant={mode === 'with-turns' ? 'primary' : 'ghost'}
          className="segmented-control-btn"
          onClick={() => setMode('with-turns')}
        >
          With Turn
        </PixelButton>
      </div>

      <div className="puzzle-cards">
        {puzzles.map(puzzle => {
          const best = getBest(puzzle.id);
          const verifiedMoves = puzzle.verifiedOptimalMoves ?? puzzle.optimalMoves;
          const displayMoves = verifiedMoves > 0 ? verifiedMoves : '?';
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
                variant="primary"
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
        <PixelButton variant="ghost" onClick={onBack}>← Back</PixelButton>
      </div>
    </div>
  );
}
