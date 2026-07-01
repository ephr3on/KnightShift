import { useState, useCallback, useEffect, useRef } from 'react';
import type { Puzzle, Piece, MoveRecord, Color } from '../types';
import type { OnlineRoom } from '../multiplayer/types';
import {
  applyMove,
  checkWin,
  getLegalMoves,
  getMoveNotation,
  type GameState,
} from '../gameLogic';
import Board from './Board';
import PixelButton from './PixelButton';
import ScreenHeader from './ScreenHeader';
import {
  subscribeToRoom,
  updateMoveCount,
  submitSolved,
  submitMoveLimitReached,
  resolveTimeLimit,
  leaveRoom,
  forfeitAndLeave,
  startPresenceHeartbeat,
  isPlayerOnline,
  claimVictoryAfterDisconnect,
} from '../multiplayer/onlineRoomService';
import { saveOnlineRaceProgress, loadOnlineRaceProgress, clearOnlineRaceProgress } from '../multiplayer/onlineRaceProgressStorage';

interface Props {
  puzzle: Puzzle;
  room: OnlineRoom;
  playerId: string;
  playerName: string;
  onFinish: (room: OnlineRoom) => void;
}

function deepClone(pieces: Piece[]): Piece[] {
  return pieces.map(p => ({ ...p }));
}

function formatTime(s: number): string {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

/** Safely read milliseconds from a Firestore Timestamp or plain {seconds} object. */
function getTimestampMillis(ts: unknown): number | null {
  if (!ts || typeof ts !== 'object') return null;
  const obj = ts as Record<string, unknown>;
  if (typeof obj.toMillis === 'function') return (obj.toMillis as () => number)();
  if (typeof obj.seconds === 'number') return obj.seconds * 1000;
  return null;
}

function buildOnlineGameState(
  puzzleId: string,
  pieces: Piece[],
  selectedPieceId: string | null,
  currentTurn: Color,
  moveHistory: MoveRecord[],
  gameOver: boolean,
): GameState {
  return {
    puzzleId,
    status: gameOver ? 'won' : 'playing',
    pieces,
    selectedPieceId,
    currentTurn,
    moveCount: moveHistory.length,
    moveHistory,
  };
}

export default function OnlineRace({
  puzzle,
  room: initialRoom,
  playerId,
  playerName,
  onFinish,
}: Props) {
  // Stable role — derived from initialRoom which never changes
  const myRole = initialRoom.hostId === playerId ? 'host' : 'guest';
  const opponentRole = myRole === 'host' ? 'guest' : 'host';

  const [pieces, setPieces] = useState<Piece[]>(() => deepClone(puzzle.initialPieces));
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<MoveRecord[]>([]);
  const [turn, setTurn] = useState<Color>('white');

  const [won, setWon] = useState(false);
  const [moveLimitHit, setMoveLimitHit] = useState(false);
  const [timeLimitExpired, setTimeLimitExpired] = useState(false);

  const [shakeId, setShakeId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [room, setRoom] = useState<OnlineRoom>(initialRoom);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [forfeiting, setForfeiting] = useState(false);
  const [reconnectedWithProgress, setReconnectedWithProgress] = useState(false);

  const startTimeRef = useRef(Date.now());
  const solvedRef = useRef(false);
  const moveLimitHitRef = useRef(false);
  const timeLimitExpiredRef = useRef(false);
  const finishedRef = useRef(false);
  const historyLengthRef = useRef(0);
  const localHistoryRef = useRef<HTMLDivElement>(null);
  const startedAtMsRef = useRef<number | null>(
    getTimestampMillis(initialRoom.timeLimitStartedAt),
  );

  const latestRoomRef = useRef<OnlineRoom>(initialRoom);
  const onFinishRef = useRef(onFinish);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);
  useEffect(() => { latestRoomRef.current = room; }, [room]);
  useEffect(() => { historyLengthRef.current = history.length; }, [history.length]);
  useEffect(() => {
    if (localHistoryRef.current) {
      localHistoryRef.current.scrollTop = localHistoryRef.current.scrollHeight;
    }
  }, [history]);

  const gameOver = won || moveLimitHit || timeLimitExpired;

  // Mark disconnected on true browser close — NOT in useEffect cleanup (StrictMode)
  useEffect(() => {
    const handler = () => { leaveRoom(initialRoom.roomCode, myRole).catch(() => {}); };
    window.addEventListener('beforeunload', handler);
    window.addEventListener('pagehide', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
      window.removeEventListener('pagehide', handler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Presence heartbeat
  useEffect(() => {
    return startPresenceHeartbeat(initialRoom.roomCode, myRole);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore race progress on reconnect (replay stored moves onto initial board)
  useEffect(() => {
    const seed = initialRoom.puzzleSeed;
    if (!seed) return;
    const storedMoves = loadOnlineRaceProgress(initialRoom.roomCode, playerId, seed);
    if (!storedMoves || storedMoves.length === 0) return;

    let restored = deepClone(puzzle.initialPieces);
    const restoredHistory: MoveRecord[] = [];
    for (const move of storedMoves) {
      restored = restored.map(p => p.id === move.pieceId ? { ...p, cell: move.to } : p);
      restoredHistory.push(move);
    }
    setPieces(restored);
    setHistory(restoredHistory);
    if (puzzle.mode === 'with-turns') {
      setTurn(storedMoves.length % 2 === 0 ? 'white' : 'black');
    }
    setReconnectedWithProgress(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ONE room subscription — covers room status, opponent stats, and match result
  useEffect(() => {
    const unsub = subscribeToRoom(initialRoom.roomCode, r => {
      if (!r) return;
      latestRoomRef.current = r;
      setRoom(r);

      // Capture timeLimitStartedAt once the server timestamp resolves
      if (r.timeLimitStartedAt && startedAtMsRef.current === null) {
        startedAtMsRef.current = getTimestampMillis(r.timeLimitStartedAt);
      }

      if (r.status === 'finished' && !finishedRef.current) {
        finishedRef.current = true;
        clearOnlineRaceProgress();
        onFinishRef.current(r);
      }
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local elapsed timer (personal stopwatch — not written to Firestore on every tick)
  useEffect(() => {
    const id = setInterval(() => {
      if (!won && !moveLimitHit && !timeLimitExpired) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [won, moveLimitHit, timeLimitExpired]);

  // Time limit countdown (local — only final timeMs written to Firestore on expiry)
  useEffect(() => {
    const tl = initialRoom.puzzleConfig.timeLimitSeconds ?? 0;
    if (tl === 0) return;

    const id = setInterval(() => {
      const startMs = startedAtMsRef.current;
      if (!startMs) return;

      const remaining = Math.max(0, Math.ceil((startMs + tl * 1000 - Date.now()) / 1000));
      setTimeRemaining(remaining);

      if (remaining <= 0 && !timeLimitExpiredRef.current && !solvedRef.current) {
        timeLimitExpiredRef.current = true;
        setTimeLimitExpired(true);
        const nowMs = Date.now() - startTimeRef.current;
        resolveTimeLimit(
          initialRoom.roomCode,
          myRole,
          nowMs,
          historyLengthRef.current,
        ).catch(console.error);
      }
    }, 500);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opponentData = room.players[opponentRole];
  const withTurns = puzzle.mode === 'with-turns';
  const moveLimit = room.moveLimit ?? null;
  const lastMove = room.lastMove;

  const handleCellClick = useCallback((cell: string) => {
    if (gameOver) return;
    const pieceOnCell = pieces.find(p => p.cell === cell);

    if (pieceOnCell) {
      if (withTurns && pieceOnCell.color !== turn) {
        setShakeId(pieceOnCell.id);
        setTimeout(() => setShakeId(null), 400);
        return;
      }
      setSelected(prev => prev === pieceOnCell.id ? null : pieceOnCell.id);
      return;
    }

    if (!selected) return;

    const localGameState = buildOnlineGameState(
      puzzle.id, pieces, selected, turn, history, gameOver,
    );
    const result = applyMove(localGameState, selected, cell, puzzle);

    if (!result.ok || !result.move) {
      setSelected(null);
      return;
    }

    const { state: nextState, move } = result;
    setPieces(nextState.pieces);
    setHistory(nextState.moveHistory);
    setSelected(null);
    setTurn(nextState.currentTurn);

    // Save progress so we can restore on reconnect
    if (initialRoom.puzzleSeed) {
      saveOnlineRaceProgress(initialRoom.roomCode, playerId, initialRoom.puzzleSeed, nextState.moveHistory);
    }

    // Optimistic: board updates instantly; Firestore is async sync only
    updateMoveCount(initialRoom.roomCode, myRole, nextState.moveCount, move.from, move.to).catch(() => {});

    if (checkWin(nextState.pieces, puzzle.goalPieces) && !solvedRef.current) {
      solvedRef.current = true;
      setWon(true);
      const nowMs = Date.now() - startTimeRef.current;
      submitSolved(
        initialRoom.roomCode,
        myRole,
        playerName,
        nextState.moveCount,
        nowMs,
        playerId,
      ).catch(() => {});
    } else if (
      moveLimit !== null &&
      nextState.moveCount >= moveLimit &&
      !moveLimitHitRef.current &&
      !solvedRef.current
    ) {
      moveLimitHitRef.current = true;
      setMoveLimitHit(true);
      const nowMs = Date.now() - startTimeRef.current;
      submitMoveLimitReached(
        initialRoom.roomCode,
        myRole,
        nextState.moveCount,
        nowMs,
      ).catch(console.error);
    }
  }, [pieces, selected, history, gameOver, withTurns, turn, puzzle, moveLimit, initialRoom.roomCode, initialRoom.puzzleSeed, myRole, playerId, playerName]);

  const handleLeaveConfirm = async () => {
    setForfeiting(true);
    await forfeitAndLeave(initialRoom.roomCode, myRole).catch(() => {});
    // Navigation is driven by the room subscription: forfeit sets status → 'finished',
    // the onSnapshot callback fires onFinish(r), and both players go to the result screen.
  };

  const handleClaimDisconnect = async () => {
    if (!opponentData || isPlayerOnline(opponentData)) return;
    await claimVictoryAfterDisconnect(initialRoom.roomCode, playerId, playerName).catch(console.error);
  };

  const selectedPiece = pieces.find(p => p.id === selected) ?? null;
  const possibleMoves = selectedPiece
    ? getLegalMoves(buildOnlineGameState(puzzle.id, pieces, selected, turn, history, gameOver), selectedPiece.id, puzzle)
    : [];
  const opponentOnline = opponentData ? isPlayerOnline(opponentData) : true;
  const opponentDisconnected =
    opponentData !== undefined && !opponentOnline && !gameOver &&
    room.status === 'playing' && room.winnerId === undefined;

  const movesRemaining = moveLimit !== null ? moveLimit - history.length : null;
  const movesRemainingColor =
    movesRemaining !== null && movesRemaining <= 3 ? 'var(--red)'
    : movesRemaining !== null && movesRemaining <= 7 ? 'var(--yellow)'
    : 'var(--text-dim)';

  const timeCritical = timeRemaining !== null && timeRemaining <= 30;
  const rounds = room.puzzleConfig.rounds;
  const currentRound = room.currentRound ?? 1;

  return (
    <div className="game-screen online-race-screen">
      {/* Leave confirmation overlay */}
      {showLeaveConfirm && (
        <div className="online-leave-overlay">
          <div className="online-leave-dialog">
            {forfeiting ? (
              <>
                <div style={{ fontSize: 10, color: 'var(--yellow)', marginBottom: 12 }}>Forfeiting…</div>
                <div style={{ fontSize: 8, color: 'var(--text-dim)' }}>
                  Taking you to the result screen.
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 10, color: 'var(--yellow)', marginBottom: 12 }}>Leave Race?</div>
                <div style={{ fontSize: 8, color: 'var(--text-dim)', marginBottom: 20, textAlign: 'center' }}>
                  You'll forfeit the match.<br />Your opponent will be declared the winner.
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <PixelButton variant="danger" onClick={handleLeaveConfirm}>Leave</PixelButton>
                  <PixelButton variant="primary" onClick={() => setShowLeaveConfirm(false)}>Stay</PixelButton>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <ScreenHeader
        title="Online Race"
        subtitle={`${rounds > 1 ? `Round ${currentRound} of ${rounds} · ` : ''}${puzzle.difficulty} · ${room.puzzleConfig.boardSize} board${withTurns && !gameOver ? ` · Turn: ${turn === 'white' ? 'White' : 'Black'}` : ''}`}
        right={
          <>
            <div className={`online-race-clock${timeCritical ? ' critical' : ''}`}>
              {formatTime(timeRemaining ?? elapsed)}
            </div>
            <PixelButton
              variant="danger"
              className="screen-header-btn"
              onClick={() => setShowLeaveConfirm(true)}
              disabled={gameOver}
            >
              Leave
            </PixelButton>
          </>
        }
      />

      {/* Opponent disconnect banner */}
      {opponentDisconnected && (
        <div className="online-disconnect-banner">
          <span>⚠ {opponentData.name} disconnected — keep solving or claim if they do not return.</span>
          <button type="button" onClick={handleClaimDisconnect}>Claim Win</button>
        </div>
      )}

      {/* Left panel */}
      <div className="panel left-panel online-status-panel">
        {reconnectedWithProgress && (
          <div style={{ fontSize: 7, color: 'var(--yellow)', marginBottom: 8, textAlign: 'center' }}>
            ↻ Reconnected — progress restored
          </div>
        )}
        <div className="panel-title" style={{ color: 'var(--yellow)' }}>You</div>
        <div style={{ fontSize: 9, color: '#fff', marginBottom: 4 }}>{playerName}</div>

        <div style={{ fontSize: 8, color: 'var(--text-dim)', marginBottom: 2 }}>
          Moves: <span style={{ color: '#fff' }}>{history.length}</span>
          {moveLimit !== null && !moveLimitHit && (
            <span style={{ color: movesRemainingColor, marginLeft: 6, fontSize: 7 }}>
              ({movesRemaining} left)
            </span>
          )}
        </div>

        <div style={{ fontSize: 9, color: 'var(--yellow)', marginBottom: 8 }}>
          ⏱ {formatTime(elapsed)}
        </div>

        {won && (
          <div style={{
            fontSize: 8, color: 'var(--green)', marginBottom: 12,
            border: '2px solid var(--green)', padding: '6px 8px',
          }}>
            ✓ Solved! Waiting…
          </div>
        )}
        {moveLimitHit && (
          <div style={{
            fontSize: 8, color: 'var(--red)', marginBottom: 12,
            border: '2px solid var(--red)', padding: '6px 8px',
          }}>
            ✗ Move limit reached
            <div style={{ fontSize: 6, marginTop: 4 }}>Waiting for opponent…</div>
          </div>
        )}
        {timeLimitExpired && !won && (
          <div style={{
            fontSize: 8, color: 'var(--yellow)', marginBottom: 12,
            border: '2px solid var(--yellow)', padding: '6px 8px',
          }}>
            ⏰ Time's up!
          </div>
        )}

        {/* Opponent section */}
        <div className="race-opponent-section" style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
          <div className="panel-title" style={{ marginBottom: 8 }}>Opponent</div>
          {opponentData ? (
            <>
              <div style={{ fontSize: 9, color: '#fff', marginBottom: 4 }}>{opponentData.name}</div>
              <div style={{
                fontSize: 7,
                color: opponentOnline ? 'var(--text-dim)' : 'var(--red)',
                marginBottom: 6,
              }}>
                {opponentOnline ? '● Online' : '○ Disconnected'}
              </div>
              <div style={{ fontSize: 8, color: 'var(--text-dim)' }}>
                Moves: {opponentData.moveCount}
                {moveLimit !== null && (
                  <span style={{ fontSize: 6, color: 'var(--text-dim)', marginLeft: 4 }}>
                    / {moveLimit}
                  </span>
                )}
              </div>
              {/* Last move received from opponent */}
              {lastMove && lastMove.role === opponentRole && (
                <div style={{ fontSize: 7, color: 'var(--text-dim)', marginTop: 4 }}>
                  Last: {lastMove.from}→{lastMove.to}
                </div>
              )}
              {opponentData.solved && (
                <div style={{ fontSize: 8, color: 'var(--red)', marginTop: 6 }}>✓ Solved!</div>
              )}
              {opponentData.moveLimitReached && !opponentData.solved && (
                <div style={{ fontSize: 7, color: 'var(--text-dim)', marginTop: 6 }}>
                  ✗ Move limit reached
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 7, color: 'var(--text-dim)' }}>Disconnected</div>
          )}
        </div>

        {/* Move history */}
        <div className={`race-moves-section mobile-race-history-section ${history.length > 4 ? 'has-older-moves' : ''}`} style={{ borderTop: '2px solid var(--border)', paddingTop: 10, marginTop: 12 }}>
          <div className="panel-title" style={{ marginBottom: 6 }}>Moves</div>
          <div className={`move-history-list ${history.length > 4 ? 'has-older-moves' : ''}`} ref={localHistoryRef} style={{ maxHeight: 120 }}>
            {history.map((m, i) => (
              <div
                key={i}
                className={`move-history-item ${m.color}`}
                style={{ fontSize: 6 }}
              >
                {i + 1}. {getMoveNotation(m.color, m.from, m.to)}
              </div>
            ))}
          </div>
        </div>

        <div className="race-leave-section" style={{ marginTop: 'auto', paddingTop: 16 }}>
          <PixelButton
            variant="danger"
            className="btn-compact"
            onClick={() => setShowLeaveConfirm(true)}
            style={{ width: '100%' }}
          >
            Leave Race
          </PixelButton>
        </div>
      </div>

      {/* Board */}
      <div className="board-area">
        <div className={shakeId ? 'shake' : ''} key={shakeId}>
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
        <div className="panel goal-panel">
          <div className="goal-label">Goal:</div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
            <Board
              cells={puzzle.cells}
              pieces={puzzle.goalPieces.flatMap((g, gi) =>
                g.cells.map((c, ci) => ({ id: `goal-${gi}-${ci}`, color: g.color, cell: c }))
              )}
              size="small"
            />
          </div>
        </div>

        <div className="action-buttons">
          <PixelButton variant="secondary" className="control-btn" onClick={() => setSelected(null)} disabled={!selected || gameOver}>
            Clear Selection
          </PixelButton>
          <PixelButton variant="danger" className="control-btn" onClick={() => setShowLeaveConfirm(true)} disabled={gameOver}>
            Leave Race
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
