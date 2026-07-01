import { useState, useCallback, useRef, useEffect } from 'react';
import type { Puzzle, MoveRecord } from '../types';
import {
  applyMove,
  createInitialGameState,
  getHint as getCoreHint,
  getLegalMoves,
  getMoveNotation,
  selectPiece,
  undoMove,
  type GameState,
} from '../gameLogic';
import Board from './Board';
import PixelButton from './PixelButton';
import ScreenHeader from './ScreenHeader';
import WinModal from './WinModal';
import SolverModal from './SolverModal';
import { completeCampaignLevel } from '../storage';

interface Props {
  puzzle: Puzzle;
  onBack: () => void;
  onBackToMenu: () => void;
}

type CoreHint = ReturnType<typeof getCoreHint>;

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
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(puzzle));
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [personalBest, setPersonalBest] = useState<number | null>(getBest(puzzle.id));
  const [showSolver, setShowSolver] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [hint, setHint] = useState<CoreHint | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const withTurns = puzzle.mode === 'with-turns';
  const pieces = gameState.pieces;
  const selected = gameState.selectedPieceId;
  const history: MoveRecord[] = gameState.moveHistory;
  const turn = gameState.currentTurn;
  const won = gameState.status === 'won';

  useEffect(() => {
    setGameState(createInitialGameState(puzzle));
    setHint(null);
    setIsNewBest(false);
    setPersonalBest(getBest(puzzle.id));
    setShowMoreActions(false);
    setShowSolver(false);
  }, [puzzle]);

  // Auto-scroll history
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  const possibleMoves = selected ? getLegalMoves(gameState, selected, puzzle) : [];

  const triggerShake = (id: string) => {
    setShakeId(id);
    setTimeout(() => setShakeId(null), 400);
  };

  const requestHint = () => {
    if (won) return;
    setHint(getCoreHint(gameState, puzzle));
  };

  const handleCellClick = useCallback((cell: string) => {
    if (gameState.status === 'won') return;

    const pieceOnCell = gameState.pieces.find(p => p.cell === cell);

    // Clicking a piece
    if (pieceOnCell) {
      // Turn enforcement
      if (withTurns && pieceOnCell.color !== gameState.currentTurn) {
        triggerShake(pieceOnCell.id);
        return;
      }

      setGameState(state => selectPiece(
        state,
        state.selectedPieceId === pieceOnCell.id ? null : pieceOnCell.id,
      ));
      return;
    }

    // Clicking an empty cell — try to move selected piece there
    if (gameState.selectedPieceId) {
      const result = applyMove(gameState, gameState.selectedPieceId, cell, puzzle);
      if (result.ok) {
        setGameState(result.state);
        setHint(null);

        if (result.won) {
          const nb = saveBest(puzzle.id, result.state.moveCount);
          if (puzzle.campaignLevel) {
            completeCampaignLevel(puzzle.campaignLevel, result.state.moveCount);
          }
          setIsNewBest(nb);
          setPersonalBest(getBest(puzzle.id));
        }
      } else {
        setGameState(state => selectPiece(state, null));
      }
    }
  }, [gameState, withTurns, puzzle]);

  const undo = () => {
    const result = undoMove(gameState, puzzle);
    if (!result.ok) return;
    setGameState(result.state);
    setHint(null);
    setIsNewBest(false);
  };

  const restart = () => {
    setGameState(createInitialGameState(puzzle));
    setShakeId(null);
    setHint(null);
    setShowMoreActions(false);
    setIsNewBest(false);
  };


  const modeLabel = puzzle.mode === 'no-turns' ? 'No Turns' : 'With Turns';
  const hintFrom = hint?.ok ? hint.from : null;
  const hintTo = hint?.ok ? hint.to : null;

  return (
    <div className="game-screen solo-game-screen">
      <ScreenHeader
        title={puzzle.name}
        subtitle={`${modeLabel} · Optimal ${puzzle.optimalMoves} moves${puzzle.campaignLevel ? ` · Level ${puzzle.campaignLevel}` : ''}`}
        onBack={onBack}
        backLabel="Back"
        right={withTurns && !won ? (
          <div className="turn-indicator">
            Turn:{' '}
            <span className={turn === 'white' ? 'turn-white' : 'turn-black'}>
              {turn === 'white' ? '♘ White' : '♞ Black'}
            </span>
          </div>
        ) : null}
      />

      {/* Left panel: Moves History */}
      <div className={`panel left-panel move-history-panel ${history.length > 4 ? 'has-older-moves' : ''}`}>
        <div className="panel-title">Moves History</div>
        <div className={`move-history-list ${history.length > 4 ? 'has-older-moves' : ''}`} ref={historyRef}>
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
        <div className="play-board-stack">
          <button
            type="button"
            className="hint-fab"
            onClick={requestHint}
            disabled={won}
            aria-label="Show best next move hint"
          >
            💡 Hint
          </button>

          {hint && (
            <div
              className={`hint-toast ${hint.ok ? 'is-ready' : 'is-error'}`}
              title={hint.message}
            >
              <span>{hint.message}</span>
              {hint.ok && hint.remainingMoves !== undefined && (
                <strong>{hint.remainingMoves} left</strong>
              )}
            </div>
          )}

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
              hintFromCell={hintFrom}
              hintToCell={hintTo}
              onCellClick={handleCellClick}
              size="normal"
              showCoords
            />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="right-panel" style={{ padding: 0 }}>
        {/* Goal preview */}
        <div className="panel goal-panel">
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



        {/* Action buttons */}
        <div className="action-buttons action-dock has-more-actions">
          <PixelButton variant="primary" className="control-btn control-primary" onClick={undo} disabled={history.length === 0}>
            ↶ Undo
          </PixelButton>
          <PixelButton variant="secondary" className="control-btn" onClick={restart}>↻ Restart</PixelButton>
          <button
            type="button"
            className={`action-more-toggle ${showMoreActions ? 'active' : ''}`}
            onClick={() => setShowMoreActions(v => !v)}
            aria-label="More actions"
          >
            ⋯
          </button>
          {showMoreActions && (
            <div className="action-overflow-popover">
              <button type="button" onClick={() => { setShowSolver(true); setShowMoreActions(false); }}>
                Analyze solution
              </button>
              <button type="button" onClick={onBackToMenu}>
                Main menu
              </button>
            </div>
          )}
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
