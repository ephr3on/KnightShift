import { useState, useEffect, useRef } from 'react';
import PixelButton from './PixelButton';
import ScreenHeader from './ScreenHeader';
import {
  subscribeToRoom,
  subscribeToRounds,
  returnToLobby,
  requestRematch,
  requestNewMatch,
  prepareRematch,
  prepareNextRound,
  startPresenceHeartbeat,
  markPlayerLeftRoom,
  markPlayerDisconnected,
  isPlayerOnline,
} from '../multiplayer/onlineRoomService';
import { clearOnlineSession } from '../multiplayer/onlineSessionStorage';
import { clearOnlineRaceProgress } from '../multiplayer/onlineRaceProgressStorage';
import type {
  OnlineRoom,
  OnlinePlayerData,
  RoundResult,
  RoomScore,
  RoundCount,
} from '../multiplayer/types';
import { DEFAULT_ROOM_SCORE } from '../multiplayer/types';

interface Props {
  room: OnlineRoom;
  playerId: string;
  /** Called when the room leaves 'finished' — navigates back to lobby. */
  onRematch: (newRoom: OnlineRoom) => void;
  onExit: () => void;
}

function formatTime(s: number): string {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

function formatTimeLimit(seconds: number): string {
  if (seconds === 0) return 'No limit';
  if (seconds < 60) return `${seconds}s`;
  return `${seconds / 60} min`;
}

function formatMoveLimit(mode: string, limit: number | null | undefined): string {
  if (mode === 'none' || limit === null || limit === undefined) return 'No limit';
  return `${limit} moves (${mode})`;
}

function matchWinner(score: RoomScore, rounds: RoundCount): 'host' | 'guest' | null {
  const required = Math.ceil(rounds / 2);
  if (score.hostWins >= required) return 'host';
  if (score.guestWins >= required) return 'guest';
  return null;
}

export default function OnlineResult({
  room: initialRoom,
  playerId,
  onRematch,
  onExit,
}: Props) {
  const [room, setRoom] = useState<OnlineRoom>(initialRoom);
  const [rounds, setRounds] = useState<RoundResult[]>([]);

  const hasReturnedRef = useRef(false);
  const onRematchRef = useRef(onRematch);
  useEffect(() => { onRematchRef.current = onRematch; }, [onRematch]);

  const myRole = room.hostId === playerId ? 'host' : 'guest';
  const isHost = myRole === 'host';

  // ONE room subscription + rounds subcollection
  useEffect(() => {
    const unsubRoom = subscribeToRoom(initialRoom.roomCode, r => {
      if (!r) return;
      setRoom(r);
      if (
        (r.status === 'waiting' || r.status === 'generating' || r.status === 'countdown') &&
        !hasReturnedRef.current
      ) {
        hasReturnedRef.current = true;
        onRematchRef.current(r);
      }
    });
    const unsubRounds = subscribeToRounds(initialRoom.roomCode, rs => setRounds(rs));
    return () => { unsubRoom(); unsubRounds(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Host triggers the agreed-upon action when both players signal the same choice
  useEffect(() => {
    if (!isHost || room.status !== 'finished') return;
    if (room.rematch?.hostWantsRematch && room.rematch?.guestWantsRematch) {
      // Both chose "Rematch" → replay with the same seed
      prepareRematch(initialRoom.roomCode).catch(console.error);
    } else if (room.rematch?.hostWantsNewMatch && room.rematch?.guestWantsNewMatch) {
      // Both chose "New Puzzle" → generate a new puzzle
      prepareNextRound(initialRoom.roomCode).catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    room.rematch?.hostWantsRematch, room.rematch?.guestWantsRematch,
    room.rematch?.hostWantsNewMatch, room.rematch?.guestWantsNewMatch,
    room.status, isHost,
  ]);

  // Presence heartbeat
  useEffect(() => {
    return startPresenceHeartbeat(initialRoom.roomCode, myRole);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark disconnected on browser close — NOT in general cleanup (StrictMode)
  useEffect(() => {
    const handler = () => { markPlayerDisconnected(initialRoom.roomCode, myRole).catch(() => {}); };
    window.addEventListener('beforeunload', handler);
    window.addEventListener('pagehide', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
      window.removeEventListener('pagehide', handler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Derived state ────────────────────────────────────────────────────────

  const opponentRole = myRole === 'host' ? 'guest' : 'host';
  const myData = room.players[myRole];
  const opponentData = room.players[opponentRole];

  const localWon = room.winnerId === playerId;
  const isDraw = room.winnerId === '';
  const opponentWon = room.winnerId !== undefined && room.winnerId !== '' && room.winnerId !== playerId;
  const optimalMoves = room.puzzleOptimalMoves ?? null;
  const resultReason = room.resultReason;
  const winnerName = room.winnerName ?? '';
  const score: RoomScore = room.score ?? DEFAULT_ROOM_SCORE;
  const rounds_setting = room.puzzleConfig.rounds;
  const currentRound = room.currentRound ?? 1;

  const hostName = room.players.host.name;
  const guestName = room.players.guest?.name ?? 'Guest';

  // Best-of match winner
  const matchWinnerRole = rounds_setting > 1 ? matchWinner(score, rounds_setting) : null;
  const matchWinnerName =
    matchWinnerRole === 'host' ? hostName
    : matchWinnerRole === 'guest' ? guestName
    : null;

  // Rematch / New Puzzle signalling state
  const myRematch = isHost
    ? (room.rematch?.hostWantsRematch ?? false)
    : (room.rematch?.guestWantsRematch ?? false);
  const opponentRematch = isHost
    ? (room.rematch?.guestWantsRematch ?? false)
    : (room.rematch?.hostWantsRematch ?? false);
  const myNewMatch = isHost
    ? (room.rematch?.hostWantsNewMatch ?? false)
    : (room.rematch?.guestWantsNewMatch ?? false);
  const opponentNewMatch = isHost
    ? (room.rematch?.guestWantsNewMatch ?? false)
    : (room.rematch?.hostWantsNewMatch ?? false);
  const preparing = room.status === 'generating' || room.status === 'countdown';

  const headline =
    isDraw && resultReason === 'time_limit'  ? 'Time limit — Draw!'
    : isDraw && resultReason === 'move_limit' ? 'Move limit — Draw!'
    : isDraw                                  ? 'Draw!'
    : resultReason === 'solved'               ? `${winnerName} solved it first!`
    : resultReason === 'forfeit'              ? `${winnerName} wins — opponent forfeited`
    : resultReason === 'opponent_left'        ? `${winnerName} wins — opponent left`
    : resultReason === 'room_closed'          ? 'The room was closed'
    : resultReason === 'time_limit'           ? `Time limit — ${winnerName} wins!`
    : resultReason === 'move_limit'           ? `Move limit — ${winnerName} wins by fewer moves!`
    : room.winnerId ? `${winnerName} wins!`
    : 'Round ended';

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleRematch = async () => {
    await requestRematch(initialRoom.roomCode, myRole).catch(console.error);
  };

  const handleNewMatch = async () => {
    await requestNewMatch(initialRoom.roomCode, myRole).catch(console.error);
  };

  const handleBackToLobby = async () => {
    await returnToLobby(initialRoom.roomCode).catch(console.error);
  };

  const handleLeave = async () => {
    await markPlayerLeftRoom(initialRoom.roomCode, myRole).catch(console.error);
    clearOnlineSession();
    clearOnlineRaceProgress();
    onExit();
  };

  // ─── Player stat helpers ──────────────────────────────────────────────────

  const playerStatus = (p: OnlinePlayerData | undefined) => {
    if (!p) return '—';
    if (p.solved) return 'Solved';
    if (p.moveLimitReached) return 'Move limit';
    return 'Not solved';
  };
  const playerStatusColor = (p: OnlinePlayerData | undefined) => {
    if (!p) return 'var(--text-dim)';
    if (p.solved) return 'var(--green)';
    if (p.moveLimitReached) return 'var(--yellow)';
    return 'var(--red)';
  };
  const playerTime = (p: OnlinePlayerData | undefined) =>
    p && p.timeMs > 0 ? formatTime(Math.round(p.timeMs / 1000)) : '—';
  const moveDiff = (p: OnlinePlayerData | undefined) => {
    if (!p || !p.solved || optimalMoves === null) return null;
    const d = p.moveCount - optimalMoves;
    return d === 0 ? 'Perfect!' : `+${d}`;
  };

  return (
    <div className="menu-screen online-result-shell" style={{ overflowY: 'auto' }}>
      <ScreenHeader
        title="Round Result"
        subtitle={rounds_setting > 1 ? `Round ${currentRound} of ${rounds_setting} · ${headline}` : headline}
        right={<PixelButton variant="danger" className="screen-header-btn" onClick={handleLeave}>Leave</PixelButton>}
      />

      {/* ── Title ── */}
      <div className="online-result-header">
        <div className="online-result-title">
          {isDraw
            ? 'Draw!'
            : localWon ? 'You Win!'
            : opponentWon ? 'You Lose'
            : 'Round Complete'}
        </div>
        <div className="online-result-subtitle">
          {rounds_setting > 1 ? `Round ${currentRound} of ${rounds_setting} — ` : ''}{headline}
        </div>
        {(resultReason === 'time_limit' || resultReason === 'move_limit') && (
          <div style={{ fontSize: 7, color: 'var(--yellow)', marginTop: 4 }}>
            {resultReason === 'time_limit' ? 'Time limit reached.' : 'Move limit reached.'}
          </div>
        )}
      </div>

      {/* ── Match winner banner (best-of only) ── */}
      {matchWinnerName && (
        <div style={{
          textAlign: 'center', padding: '10px 20px', marginBottom: 16,
          background: 'rgba(251,191,36,0.15)', border: '2px solid var(--yellow)',
          fontSize: 10, color: 'var(--yellow)',
        }}>
          Match Winner: {matchWinnerName}
          {matchWinnerName === myData?.name && ' — You!'}
        </div>
      )}

      {/* ── Score banner ── */}
      {score.totalRounds > 0 && (
        <div className="online-score-banner">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 7, color: 'var(--text-dim)' }}>{hostName}</span>
            <span style={{ fontSize: 18, color: 'var(--yellow)', textShadow: '2px 2px 0 #000' }}>
              {score.hostWins}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>—</span>
            {score.draws > 0 && (
              <span style={{ fontSize: 7, color: 'var(--text-dim)' }}>
                {score.draws} draw{score.draws !== 1 ? 's' : ''}
              </span>
            )}
            {rounds_setting > 1 && (
              <span style={{ fontSize: 7, color: 'var(--text-dim)' }}>Best of {rounds_setting}</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 7, color: 'var(--text-dim)' }}>{guestName}</span>
            <span style={{ fontSize: 18, color: 'var(--yellow)', textShadow: '2px 2px 0 #000' }}>
              {score.guestWins}
            </span>
          </div>
        </div>
      )}

      {/* ── Player comparison cards ── */}
      <div className="online-result-cards">
        {[
          { label: 'You',      data: myData,       roleLabel: myRole,       isWinner: localWon },
          { label: 'Opponent', data: opponentData,  roleLabel: opponentRole, isWinner: opponentWon },
        ].map(({ label, data, roleLabel, isWinner }) => (
          <div key={label} className="panel online-result-card" style={{
            border: isWinner && !isDraw ? '2px solid var(--yellow)' : undefined,
          }}>
            <div className="online-result-card-label">{label}</div>
            <div className="online-result-card-name">{data?.name ?? '—'}</div>
            <div style={{ fontSize: 7, color: 'var(--text-dim)', marginBottom: 2 }}>
              {roleLabel === 'host' ? 'Host' : 'Guest'}
            </div>
            {isWinner && !isDraw && (
              <div style={{ fontSize: 9, color: 'var(--yellow)', margin: '6px 0' }}>Winner</div>
            )}
            {isDraw && (
              <div style={{ fontSize: 8, color: 'var(--text-dim)', margin: '6px 0' }}>Draw</div>
            )}
            <div style={{ fontSize: 8, lineHeight: 2.2, textAlign: 'left', width: '100%' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Status  </span>
                <span style={{ color: playerStatusColor(data) }}>{playerStatus(data)}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Moves   </span>
                <span style={{ color: '#fff' }}>{data?.moveCount ?? '—'}</span>
                {moveDiff(data) && (
                  <span style={{ color: 'var(--green)', marginLeft: 6, fontSize: 7 }}>
                    ({moveDiff(data)})
                  </span>
                )}
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Time    </span>
                <span style={{ color: '#fff' }}>{playerTime(data)}</span>
              </div>
            </div>
            {label === 'Opponent' && data && !isPlayerOnline(data) && (
              <div style={{ fontSize: 7, color: 'var(--red)', marginTop: 6 }}>
                {data.leftRoom ? 'Left the room' : 'Disconnected'}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="online-result-info-grid">
        {/* ── Puzzle stats ── */}
        {optimalMoves !== null && (
          <div className="panel online-result-info-card">
            <div className="online-result-info-title">Puzzle Stats</div>
            <div className="online-result-stat-row">
              <span>Optimal moves</span>
              <strong>{optimalMoves}</strong>
            </div>
            {myData?.solved && (
              <div className="online-result-stat-row">
                <span>Your efficiency</span>
                <strong className="good">
                  {myData.moveCount} moves ({moveDiff(myData)})
                </strong>
              </div>
            )}
            {opponentData?.solved && (
              <div className="online-result-stat-row">
                <span>Opponent efficiency</span>
                <strong className="muted">
                  {opponentData.moveCount} moves ({moveDiff(opponentData)})
                </strong>
              </div>
            )}
          </div>
        )}

        {/* ── Match settings used ── */}
        <div className="panel online-result-info-card">
          <div className="online-result-info-title">Settings Used</div>
          {[
            { label: 'Difficulty', value: room.puzzleDifficulty ?? room.puzzleConfig.difficulty },
            { label: 'Board',      value: room.puzzleConfig.boardSize },
            { label: 'Mode',       value: room.puzzleConfig.mode === 'no-turns' ? 'No Turns' : 'With Turns' },
            { label: 'Rounds',     value: rounds_setting === 1 ? '1 round' : `Best of ${rounds_setting}` },
            { label: 'Time limit', value: formatTimeLimit(room.puzzleConfig.timeLimitSeconds) },
            { label: 'Move limit', value: formatMoveLimit(room.puzzleConfig.moveLimitMode, room.moveLimit ?? null) },
          ].map(({ label, value }) => (
            <div key={label} className="online-result-stat-row">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* ── Round history ── */}
      {rounds.length > 0 && (
        <div className="panel online-round-history">
          <div style={{ fontSize: 7, color: 'var(--text-dim)', marginBottom: 8 }}>
            Round History ({rounds.length} round{rounds.length !== 1 ? 's' : ''})
          </div>
          {rounds.map(r => {
            const roundLocalWon = r.winnerRole !== 'draw' && r.winnerUid === playerId;
            const roundColor =
              r.winnerRole === 'draw' ? 'var(--text-dim)'
              : roundLocalWon ? 'var(--green)'
              : 'var(--red)';
            return (
              <div key={r.roundNumber} className="online-round-item">
                <span style={{ minWidth: 52, color: 'var(--text-dim)' }}>Rd {r.roundNumber}</span>
                <span style={{ color: roundColor, minWidth: 80 }}>
                  {r.winnerRole === 'draw' ? 'Draw'
                    : r.winnerUid === playerId ? 'You won'
                    : `${r.winnerName} won`}
                </span>
                <span style={{ color: 'var(--text-dim)', minWidth: 60 }}>
                  {r.resultReason?.replace(/_/g, ' ')}
                </span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', display: 'flex', gap: 8 }}>
                  <span title={`${hostName} moves`}>H:{r.hostStats.moves}</span>
                  <span title={`${guestName} moves`}>G:{r.guestStats.moves}</span>
                  {r.optimalMoves !== null && (
                    <span style={{ color: 'var(--yellow)' }}>opt:{r.optimalMoves}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="online-result-actions">

        {/* Rematch */}
        <PixelButton
          onClick={handleRematch}
          disabled={preparing}
          variant={myRematch && !preparing ? "success" : "primary"}
          className="online-result-action-btn online-result-main-action"
        >
          {preparing ? 'Preparing…' : 'Rematch'}
        </PixelButton>

        {/* New Puzzle */}
        <PixelButton
          onClick={handleNewMatch}
          disabled={preparing}
          variant={myNewMatch && !preparing ? "success" : "secondary"}
          className="online-result-action-btn online-result-main-action"
        >
          {preparing ? 'Preparing…' : 'New Puzzle'}
        </PixelButton>

        {/* Status messages — shown when either player has signalled */}
        {!preparing && (myRematch || myNewMatch || opponentRematch || opponentNewMatch) && (() => {
          let msg = '';
          if (myRematch && opponentRematch)      msg = 'Both chose Rematch — preparing…';
          else if (myNewMatch && opponentNewMatch) msg = 'Both chose New Puzzle — preparing…';
          else if (myRematch && opponentNewMatch)  msg = 'You chose Rematch — opponent chose New Puzzle';
          else if (myNewMatch && opponentRematch)  msg = 'You chose New Puzzle — opponent chose Rematch';
          else if (myRematch)                      msg = 'You chose Rematch — waiting for opponent…';
          else if (myNewMatch)                     msg = 'You chose New Puzzle — waiting for opponent…';
          else if (opponentRematch)                msg = '⚡ Opponent wants to rematch same puzzle!';
          else if (opponentNewMatch)               msg = '⚡ Opponent wants a new match!';
          return msg ? (
            <div className="online-result-choice-note">
              {msg}
            </div>
          ) : null;
        })()}

        <PixelButton variant="ghost" onClick={handleBackToLobby} className="online-result-action-btn online-result-sub-action">
          Lobby
        </PixelButton>

        <PixelButton variant="danger" onClick={handleLeave} className="online-result-action-btn online-result-sub-action">
          Leave
        </PixelButton>
      </div>
    </div>
  );
}
