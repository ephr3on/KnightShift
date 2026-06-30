import { useState, useCallback, useEffect, useRef } from 'react';
import type { Puzzle, Piece, MoveRecord, Color } from '../types';
import type { OnlineRoom } from '../multiplayer/types';
import { getPossibleMoves, checkWin, getMoveNotation } from '../gameLogic';
import Board from './Board';
import PixelButton from './PixelButton';
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
  const [historyStack, setHistoryStack] = useState<Piece[][]>([]);
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
  const startedAtMsRef = useRef<number | null>(
    getTimestampMillis(initialRoom.timeLimitStartedAt),
  );

  const latestRoomRef = useRef<OnlineRoom>(initialRoom);
  const onFinishRef = useRef(onFinish);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);
  useEffect(() => { latestRoomRef.current = room; }, [room]);
  useEffect(() => { historyLengthRef.current = history.length; }, [history.length]);

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
    const restoredStack: Piece[][] = [];
    for (const move of storedMoves) {
      restoredStack.push(deepClone(restored));
      restored = restored.map(p => p.id === move.pieceId ? { ...p, cell: move.to } : p);
      restoredHistory.push(move);
    }
    setPieces(restored);
    setHistory(restoredHistory);
    setHistoryStack(restoredStack);
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

    if (selected) {
      const movingPiece = pieces.find(p => p.id === selected);
      if (!movingPiece) { setSelected(null); return; }
      const moves = getPossibleMoves(movingPiece, pieces, puzzle.cells);

      if (moves.includes(cell)) {
        const from = movingPiece.cell;
        setHistoryStack(s => [...s, deepClone(pieces)]);
        const newPieces = pieces.map(p => p.id === selected ? { ...p, cell } : p);
        setPieces(newPieces);
        const record: MoveRecord = { pieceId: selected, color: movingPiece.color, from, to: cell };
        const newHistory = [...history, record];
        setHistory(newHistory);
        setSelected(null);
        if (withTurns) setTurn(t => t === 'white' ? 'black' : 'white');

        // Save progress so we can restore on reconnect
        if (initialRoom.puzzleSeed) {
          saveOnlineRaceProgress(initialRoom.roomCode, playerId, initialRoom.puzzleSeed, newHistory);
        }

        // Optimistic: board updates instantly; Firestore is async sync only
        updateMoveCount(initialRoom.roomCode, myRole, newHistory.length, from, cell).catch(() => {});

        if (checkWin(newPieces, puzzle.goalPieces) && !solvedRef.current) {
          solvedRef.current = true;
          setWon(true);
          const nowMs = Date.now() - startTimeRef.current;
          submitSolved(
            initialRoom.roomCode,
            myRole,
            playerName,
            newHistory.length,
            nowMs,
            playerId,
          ).catch(() => {});
        } else if (
          moveLimit !== null &&
          newHistory.length >= moveLimit &&
          !moveLimitHitRef.current &&
          !solvedRef.current
        ) {
          moveLimitHitRef.current = true;
          setMoveLimitHit(true);
          const nowMs = Date.now() - startTimeRef.current;
          submitMoveLimitReached(
            initialRoom.roomCode,
            myRole,
            newHistory.length,
            nowMs,
          ).catch(console.error);
        }
      } else {
        setSelected(null);
      }
    }
  }, [pieces, selected, history, gameOver, withTurns, turn, puzzle, moveLimit, initialRoom.roomCode, myRole, playerId, playerName]);

  const undo = () => {
    if (historyStack.length === 0 || gameOver) return;
    const prev = historyStack[historyStack.length - 1];
    setHistoryStack(s => s.slice(0, -1));
    setPieces(prev);
    setHistory(h => h.slice(0, -1));
    setSelected(null);
    if (withTurns) setTurn(t => t === 'white' ? 'black' : 'white');
  };

  const restart = () => {
    if (gameOver) return;
    setPieces(deepClone(puzzle.initialPieces));
    setSelected(null);
    setHistory([]);
    setHistoryStack([]);
    setTurn('white');
    setShakeId(null);
  };

  const handleLeaveConfirm = async () => {
    setForfeiting(true);
    await forfeitAndLeave(initialRoom.roomCode, myRole).catch(() => {});
    // Navigation is driven by the room subscription: forfeit sets status → 'finished',
    // the onSnapshot callback fires onFinish(r), and both players go to the result screen.
  };

  const selectedPiece = pieces.find(p => p.id === selected) ?? null;
  const possibleMoves = selectedPiece ? getPossibleMoves(selectedPiece, pieces, puzzle.cells) : [];
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
    <div className="game-screen">
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
                  <PixelButton onClick={handleLeaveConfirm}>Leave</PixelButton>
                  <PixelButton onClick={() => setShowLeaveConfirm(false)}>Stay</PixelButton>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Title row */}
      <div className="game-title-row">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="game-title" style={{ fontSize: 11 }}>
            ⚡ Online Race
            {rounds > 1 && (
              <span style={{ fontSize: 8, color: 'var(--text-dim)', marginLeft: 10 }}>
                Round {currentRound} of {rounds}
              </span>
            )}
          </div>
          <div style={{ fontSize: 6, color: 'var(--text-dim)', letterSpacing: 0.5 }}>
            {puzzle.difficulty} · {room.puzzleConfig.boardSize} board
            {room.puzzleConfig.timeLimitSeconds > 0
              ? ` · ${room.puzzleConfig.timeLimitSeconds / 60}min limit` : ''}
            {room.puzzleConfig.moveLimitMode !== 'none'
              ? ` · ${room.puzzleConfig.moveLimitMode} moves` : ''}
          </div>
        </div>
        {withTurns && !gameOver && (
          <div className="turn-indicator">
            Turn:{' '}
            <span className={turn === 'white' ? 'turn-white' : 'turn-black'}>
              {turn === 'white' ? '♘ White' : '♞ Black'}
            </span>
          </div>
        )}
        {timeRemaining !== null && (
          <div style={{
            fontSize: 13, fontWeight: 'bold',
            color: timeCritical ? 'var(--red)' : 'var(--yellow)',
            letterSpacing: 2, minWidth: 60, textAlign: 'right',
          }}>
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Opponent disconnect banner */}
      {opponentDisconnected && (
        <div className="online-disconnect-banner">
          ⚠ {opponentData.name} disconnected — continue solving or use Leave Race to forfeit
        </div>
      )}

      {/* Left panel */}
      <div className="panel left-panel">
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
        <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
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
        <div style={{ borderTop: '2px solid var(--border)', paddingTop: 10, marginTop: 12 }}>
          <div className="panel-title" style={{ marginBottom: 6 }}>Moves</div>
          <div className="move-history-list" style={{ maxHeight: 120 }}>
            {history.slice(-8).map((m, i) => (
              <div
                key={history.length - 8 + i}
                className={`move-history-item ${m.color}`}
                style={{ fontSize: 6 }}
              >
                {history.length - 8 + i + 1}. {getMoveNotation(m.color, m.from, m.to)}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <PixelButton
            onClick={() => setShowLeaveConfirm(true)}
            style={{ fontSize: 8, width: '100%' }}
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
        <div className="panel" style={{ padding: 10, marginBottom: 10 }}>
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
          <PixelButton onClick={undo} disabled={historyStack.length === 0 || gameOver}>
            Undo
          </PixelButton>
          <PixelButton onClick={restart} disabled={gameOver || history.length === 0}>
            Restart
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
