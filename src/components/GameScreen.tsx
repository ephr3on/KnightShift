import { useState, useCallback, useRef, useEffect } from 'react';
import type { Puzzle, Piece, MoveRecord, Color } from '../types';
import {
  getPossibleMoves,
  checkWin,
  getMoveNotation,
} from '../gameLogic';
import Board from './Board';
import PixelButton from './PixelButton';
import WinModal from './WinModal';
import SolverModal from './SolverModal';

interface Props {
  puzzle: Puzzle;
  onBack: () => void;
  onBackToMenu: () => void;
}

function deepClone(pieces: Piece[]): Piece[] {
  return pieces.map(p => ({ ...p }));
}

function saveBest(id: string, moves: number) {
  const current = localStorage.getItem(`best_${id}`);
  if (!current || moves < parseInt(current)) {
    localStorage.setItem(`best_${id}`, String(moves));
    return true;
  }
  return false;
}

function getBest(id: string): number | null {
  const v = localStorage.getItem(`best_${id}`);
  return v ? parseInt(v) : null;
}

export default function GameScreen({ puzzle, onBack, onBackToMenu }: Props) {
  const [pieces, setPieces] = useState<Piece[]>(deepClone(puzzle.initialPieces));
  const [selected, setSelected] = useState<string | null>(null); // pieceId
  const [history, setHistory] = useState<MoveRecord[]>([]);
  const [historyStack, setHistoryStack] = useState<Piece[][]>([]);
  const [turn, setTurn] = useState<Color>('white');
  const [won, setWon] = useState(false);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [personalBest, setPersonalBest] = useState<number | null>(getBest(puzzle.id));
  const [showSolver, setShowSolver] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  const withTurns = puzzle.mode === 'with-turns';

  // Auto-scroll history
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  const selectedPiece = pieces.find(p => p.id === selected) ?? null;
  const possibleMoves = selectedPiece
    ? getPossibleMoves(selectedPiece, pieces, puzzle.cells)
    : [];

  const triggerShake = (id: string) => {
    setShakeId(id);
    setTimeout(() => setShakeId(null), 400);
  };

  const handleCellClick = useCallback((cell: string) => {
    if (won) return;

    const pieceOnCell = pieces.find(p => p.cell === cell);

    // Clicking a piece
    if (pieceOnCell) {
      // Turn enforcement
      if (withTurns && pieceOnCell.color !== turn) {
        triggerShake(pieceOnCell.id);
        return;
      }
      // Toggle selection
      if (selected === pieceOnCell.id) {
        setSelected(null);
      } else {
        setSelected(pieceOnCell.id);
      }
      return;
    }

    // Clicking an empty cell — try to move selected piece there
    if (selected && possibleMoves.includes(cell)) {
      const piece = pieces.find(p => p.id === selected)!;
      const from = piece.cell;

      // Save snapshot for undo
      setHistoryStack(s => [...s, deepClone(pieces)]);

      const newPieces = pieces.map(p =>
        p.id === selected ? { ...p, cell } : p
      );
      setPieces(newPieces);
      setHistory(h => [...h, { pieceId: selected, color: piece.color, from, to: cell }]);
      setSelected(null);

      if (withTurns) {
        setTurn(t => (t === 'white' ? 'black' : 'white'));
      }

      if (checkWin(newPieces, puzzle.goalPieces)) {
        const moves = history.length + 1;
        const nb = saveBest(puzzle.id, moves);
        setIsNewBest(nb);
        setPersonalBest(getBest(puzzle.id));
        setWon(true);
      }
    } else if (selected) {
      // Clicked somewhere invalid — deselect
      setSelected(null);
    }
  }, [pieces, selected, possibleMoves, history, won, withTurns, turn, puzzle]);

  const undo = () => {
    if (historyStack.length === 0) return;
    const prev = historyStack[historyStack.length - 1];
    setHistoryStack(s => s.slice(0, -1));
    setPieces(prev);
    setHistory(h => h.slice(0, -1));
    setSelected(null);
    if (withTurns) {
      setTurn(t => (t === 'white' ? 'black' : 'white'));
    }
  };

  const restart = () => {
    setPieces(deepClone(puzzle.initialPieces));
    setSelected(null);
    setHistory([]);
    setHistoryStack([]);
    setTurn('white');
    setWon(false);
    setShakeId(null);
  };


  const modeLabel = puzzle.mode === 'no-turns' ? 'No Turns' : 'With Turns';
  const titleLabel = `${puzzle.name} (${modeLabel})`;

  return (
    <div className="game-screen solo-game-screen">
      {/* Title row */}
      <div className="game-title-row">
        <div className="game-title">{titleLabel}</div>
        {withTurns && !won && (
          <div className="turn-indicator">
            Turn:{' '}
            <span className={turn === 'white' ? 'turn-white' : 'turn-black'}>
              {turn === 'white' ? '♘ White' : '♞ Black'}
            </span>
          </div>
        )}
      </div>

      {/* Left panel: Moves History */}
      <div className="panel left-panel">
        <div className="panel-title">Moves History</div>
        <div className="move-history-list" ref={historyRef}>
          {history.map((m, i) => (
            <div
              key={i}
              className={`move-history-item ${m.color}`}
            >
              {i + 1}. {getMoveNotation(m.color, m.from, m.to)}
            </div>
          ))}
        </div>
        <div className="moves-count">Moves Made: {history.length}</div>
      </div>

      {/* Board */}
      <div className="board-area">
        <div
          className={shakeId ? 'shake' : ''}
          key={shakeId}
        >
          <Board
            cells={puzzle.cells}
            pieces={pieces}
            selectedPieceId={selected}
            possibleMoves={possibleMoves}
            goalPieces={puzzle.goalPieces}
            onCellClick={handleCellClick}
            size="normal"
            showCoords
          />
        </div>
      </div>

      {/* Right panel */}
      <div className="right-panel" style={{ padding: 0 }}>
        {/* Goal preview */}
        <div className="panel" style={{ padding: 10, marginBottom: 10 }}>
          <div className="goal-label">Puzzle Goal:</div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
            <Board
              cells={puzzle.cells}
              pieces={puzzle.goalPieces.flatMap((g, gi) =>
                g.cells.map((cell, ci) => ({
                  id: `goal-${gi}-${ci}`,
                  color: g.color,
                  cell,
                }))
              )}
              size="small"
            />
          </div>
        </div>

        {/* Possible Moves */}
        <div className="panel possible-moves-panel" style={{ marginBottom: 10 }}>
          <div className="panel-title">Possible Moves</div>
          <div className="possible-moves-list">
            {selectedPiece && possibleMoves.length > 0 ? (
              possibleMoves.map(cell => (
                <div
                  key={cell}
                  className="possible-move-item"
                  onClick={() => handleCellClick(cell)}
                >
                  {selectedPiece.color === 'white' ? '♘' : '♞'}{' '}
                  {selectedPiece.cell} -&gt; {cell}
                </div>
              ))
            ) : (
              <div style={{ fontSize: 7, color: 'var(--text-dim)', padding: 4 }}>
                {selectedPiece ? 'No valid moves' : 'Select a knight'}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="action-buttons">
          <PixelButton onClick={undo} disabled={historyStack.length === 0}>
            Undo Move
          </PixelButton>
          <PixelButton onClick={restart}>Restart Puzzle</PixelButton>
          <PixelButton onClick={onBackToMenu}>&lt;- Main Menu</PixelButton>
          <PixelButton
            onClick={() => setShowSolver(true)}
            style={{ fontSize: 8 }}
          >
            Analyze / Solve
          </PixelButton>
        </div>
      </div>

      {/* Win modal */}
      {won && (
        <WinModal
          moves={history.length}
          optimalMoves={puzzle.optimalMoves}
          personalBest={personalBest}
          isNewBest={isNewBest}
          onRestart={restart}
          onBack={onBack}
        />
      )}

      {/* Solver analysis modal */}
      {showSolver && (
        <SolverModal puzzle={puzzle} onClose={() => setShowSolver(false)} />
      )}
    </div>
  );
}
