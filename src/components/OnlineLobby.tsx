import { useState, useEffect, useRef } from 'react';
import type { Puzzle } from '../types';
import PixelButton from './PixelButton';
import {
  subscribeToRoom,
  subscribeToRounds,
  leaveWaitingRoom,
  hostStartMatch,
  saveSeedAndStartCountdown,
  generationFailed,
  startGame,
  updatePuzzleConfig,
  startPresenceHeartbeat,
  markPlayerLeftRoom,
  isPlayerOnline,
} from '../multiplayer/onlineRoomService';
import { loadOnlineSession, clearOnlineSession } from '../multiplayer/onlineSessionStorage';
import { clearOnlineRaceProgress } from '../multiplayer/onlineRaceProgressStorage';
import type {
  OnlineRoom,
  OnlineMatchSettings,
  RoundResult,
  Difficulty,
} from '../multiplayer/types';
import { DEFAULT_MATCH_SETTINGS } from '../multiplayer/types';
import { reproducePuzzle } from '../generator/puzzleGenerator';
import type { GeneratorWorkerRequest, GeneratorWorkerResponse } from '../workers/generatorWorker';
import { ALL_DIFFICULTIES } from '../generator/difficulty';
import { BOARD_SIZE_CONFIG } from '../generator/boardGenerator';

const BOARD_SIZES = Object.entries(BOARD_SIZE_CONFIG) as [
  keyof typeof BOARD_SIZE_CONFIG,
  (typeof BOARD_SIZE_CONFIG)[keyof typeof BOARD_SIZE_CONFIG],
][];

const TIME_LIMIT_OPTIONS: { label: string; value: number }[] = [
  { label: 'No limit', value: 0 },
  { label: '1 min',    value: 60 },
  { label: '2 min',    value: 120 },
  { label: '3 min',    value: 180 },
  { label: '5 min',    value: 300 },
];

const MOVE_LIMIT_OPTIONS: { label: string; value: OnlineMatchSettings['moveLimitMode'] }[] = [
  { label: 'No limit',    value: 'none' },
  { label: 'Optimal +2',  value: 'optimal+2' },
  { label: 'Optimal +5',  value: 'optimal+5' },
  { label: 'Optimal +10', value: 'optimal+10' },
];

const ROUNDS_OPTIONS: { label: string; value: OnlineMatchSettings['rounds'] }[] = [
  { label: '1 round',   value: 1 },
  { label: 'Best of 3', value: 3 },
  { label: 'Best of 5', value: 5 },
];

type MatchPreset = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  settings: OnlineMatchSettings;
};

const MATCH_PRESETS: MatchPreset[] = [
  {
    id: 'quick',
    title: 'Quick Duel',
    subtitle: 'Fast, light, perfect for one clean round.',
    badge: '2 min',
    settings: {
      mode: 'no-turns',
      difficulty: 'Medium',
      boardSize: 'small',
      rounds: 1,
      timeLimitSeconds: 120,
      moveLimitMode: 'none',
    },
  },
  {
    id: 'balanced',
    title: 'Balanced',
    subtitle: 'Recommended setup for most matches.',
    badge: 'Best pick',
    settings: DEFAULT_MATCH_SETTINGS,
  },
  {
    id: 'pro',
    title: 'Pro Match',
    subtitle: 'Harder puzzle, Best of 3, fair pressure.',
    badge: 'Best of 3',
    settings: {
      mode: 'no-turns',
      difficulty: 'Hard',
      boardSize: 'classic',
      rounds: 3,
      timeLimitSeconds: 180,
      moveLimitMode: 'optimal+5',
    },
  },
];

function sameSettings(a: OnlineMatchSettings, b: OnlineMatchSettings): boolean {
  return a.mode === b.mode
    && a.difficulty === b.difficulty
    && a.boardSize === b.boardSize
    && a.rounds === b.rounds
    && a.timeLimitSeconds === b.timeLimitSeconds
    && a.moveLimitMode === b.moveLimitMode;
}

function formatTimeLimit(seconds: number): string {
  if (!seconds) return 'No timer';
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)} min`;
}

function formatMoveLimit(mode: OnlineMatchSettings['moveLimitMode']): string {
  if (mode === 'none') return 'No move cap';
  return mode.replace('optimal', 'Optimal ');
}

interface Props {
  roomCode: string;
  playerId: string;
  playerName: string;
  onGameStart: (room: OnlineRoom, puzzle: Puzzle) => void;
  onLeave: () => void;
}

export default function OnlineLobby({ roomCode, playerId, playerName, onGameStart, onLeave }: Props) {
  const [room, setRoom] = useState<OnlineRoom | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState('');
  const [localSettings, setLocalSettings] = useState<OnlineMatchSettings>(DEFAULT_MATCH_SETTINGS);
  const [roomClosed, setRoomClosed] = useState(false);
  const [settingsUpdating, setSettingsUpdating] = useState(false);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const latestRoomRef = useRef<OnlineRoom | null>(null);
  /** Puzzle built locally — host from worker, guest via reproducePuzzle(). */
  const localPuzzleRef = useRef<Puzzle | null>(null);
  const gameStartedRef = useRef(false);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onGameStartRef = useRef(onGameStart);
  const prevSettingsKeyRef = useRef('');
  useEffect(() => { onGameStartRef.current = onGameStart; }, [onGameStart]);

  // ── Main room subscription (ONE listener covers all state) ──────────────────
  useEffect(() => {
    const unsubRoom = subscribeToRoom(roomCode, r => {
      if (!r) { setError('Room no longer exists.'); return; }

      if (r.status === 'closed') {
        setRoomClosed(true);
        return;
      }

      latestRoomRef.current = r;
      setRoom(r);
      setLocalSettings(r.puzzleConfig);

      // Detect settings change for guest notice
      const settingsKey = JSON.stringify(r.puzzleConfig);
      if (prevSettingsKeyRef.current && prevSettingsKeyRef.current !== settingsKey) {
        setSettingsNotice('Host updated match settings');
        setTimeout(() => setSettingsNotice(''), 3000);
      }
      prevSettingsKeyRef.current = settingsKey;

      // Reproduce puzzle from seed if not already set.
      // Covers both: normal guest path AND host during rematch (worker result lost on navigate).
      if (r.puzzleSeed && !localPuzzleRef.current) {
        const puzzle = reproducePuzzle(
          r.puzzleSeed,
          r.puzzleConfig.mode,
          r.puzzleConfig.boardSize,
          r.puzzleOptimalMoves ?? 0,
          r.puzzleDifficulty ?? r.puzzleConfig.difficulty,
        );
        if (puzzle) localPuzzleRef.current = puzzle;
      }

      if (r.status === 'playing' && !gameStartedRef.current && localPuzzleRef.current) {
        gameStartedRef.current = true;
        onGameStartRef.current(r, localPuzzleRef.current);
      }
    });

    const unsubRounds = subscribeToRounds(roomCode, rs => setRounds(rs));

    return () => {
      unsubRoom();
      unsubRounds();
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  // ── Host: run puzzle generator when status === 'generating' ─────────────────
  useEffect(() => {
    if (room?.status !== 'generating') return;
    if (room.hostId !== playerId) return; // Only the host generates

    const worker = new Worker(
      new URL('../workers/generatorWorker.ts', import.meta.url),
      { type: 'module' },
    );

    const req: GeneratorWorkerRequest = {
      type: 'generate',
      options: {
        mode: room.puzzleConfig.mode,
        difficulty: room.puzzleConfig.difficulty,
        boardSize: room.puzzleConfig.boardSize,
        maxAttempts: 300,
        maxTimeMs: 60000,
      },
    };
    worker.postMessage(req);

    worker.onmessage = (e: MessageEvent<GeneratorWorkerResponse>) => {
      const msg = e.data;
      if (msg.type === 'result') {
        if (msg.result.type === 'success') {
          // Store puzzle locally — the seed is saved to Firestore, not the board arrays
          localPuzzleRef.current = msg.result.puzzle;
          saveSeedAndStartCountdown(
            roomCode,
            msg.result.attemptSeed,
            msg.result.optimalMoves,
            msg.result.puzzle.difficulty as Difficulty,
          ).catch(err => {
            console.error('[Lobby] Failed to save seed:', err);
            generationFailed(roomCode).catch(() => {});
            setError('Failed to start countdown. Please try again.');
          });
        } else {
          generationFailed(roomCode).catch(() => {});
          setError(`Puzzle generation failed: ${msg.result.reason}. Please try again.`);
        }
        worker.terminate();
      } else if (msg.type === 'error') {
        generationFailed(roomCode).catch(() => {});
        setError(`Generator error: ${msg.message}`);
        worker.terminate();
      }
    };

    worker.onerror = err => {
      generationFailed(roomCode).catch(() => {});
      setError(`Worker error: ${err.message}`);
      worker.terminate();
    };

    return () => { worker.terminate(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.status, room?.hostId, playerId]);

  // ── Countdown animation when status === 'countdown' ─────────────────────────
  useEffect(() => {
    if (!room || room.status !== 'countdown') return;

    let count = 3;
    setCountdown(count);

    function tick() {
      count--;
      setCountdown(count);
      if (count <= 0) {
        startGame(roomCode).catch(console.error);
      } else {
        countdownTimerRef.current = setTimeout(tick, 1000);
      }
    }
    countdownTimerRef.current = setTimeout(tick, 1000);

    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.status]);

  // ── Presence heartbeat ───────────────────────────────────────────────────────
  useEffect(() => {
    const role = loadOnlineSession()?.role ?? 'guest';
    return startPresenceHeartbeat(roomCode, role);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  // Mark disconnected on browser close — NOT in general cleanup (StrictMode)
  useEffect(() => {
    const role = loadOnlineSession()?.role ?? 'guest';
    const handler = () => { markPlayerLeftRoom(roomCode, role).catch(() => {}); };
    window.addEventListener('beforeunload', handler);
    window.addEventListener('pagehide', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
      window.removeEventListener('pagehide', handler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleLeave = async () => {
    const myRole = room?.hostId === playerId ? 'host' : 'guest';
    await markPlayerLeftRoom(roomCode, myRole).catch(() => {});
    await leaveWaitingRoom(roomCode, myRole).catch(console.error);
    clearOnlineSession();
    clearOnlineRaceProgress();
    onLeave();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSettingChange = async (patch: Partial<OnlineMatchSettings>) => {
    if (!settingsEditable || settingsUpdating) return;
    const newSettings: OnlineMatchSettings = { ...localSettings, ...patch };
    setLocalSettings(newSettings); // Optimistic update
    setSettingsUpdating(true);
    setError('');
    try {
      await updatePuzzleConfig(roomCode, newSettings);
    } catch {
      setError('Failed to update settings. Please try again.');
      setLocalSettings(room?.puzzleConfig ?? DEFAULT_MATCH_SETTINGS); // Revert
    } finally {
      setSettingsUpdating(false);
    }
  };

  const handleStartMatch = async () => {
    setError('');
    if (settingsUpdating) {
      setError('Settings are still updating. Please wait.');
      return;
    }
    try {
      await hostStartMatch(roomCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start match.');
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────

  const isHost = room?.hostId === playerId;
  const myRole = isHost ? 'host' : 'guest';
  const localPlayerData = room?.players[myRole];
  const opponentData = room?.players[myRole === 'host' ? 'guest' : 'host'];
  const isCountdown = room?.status === 'countdown';
  const isGenerating = room?.status === 'generating';
  const settingsEditable = isHost && room?.status === 'waiting' && !room?.settingsLocked && !settingsUpdating;
  const canStartMatch = isHost && !!opponentData && isPlayerOnline(opponentData) && !settingsUpdating && room?.status === 'waiting';
  const activePreset = MATCH_PRESETS.find(preset => sameSettings(localSettings, preset.settings));
  const boardLabel = BOARD_SIZE_CONFIG[localSettings.boardSize]?.label ?? localSettings.boardSize;
  const roundLabel = ROUNDS_OPTIONS.find(opt => opt.value === localSettings.rounds)?.label ?? `${localSettings.rounds} round`;
  const modeLabel = localSettings.mode === 'no-turns' ? 'No turns' : 'With turns';
  const difficultyLabel = localSettings.difficulty;
  const timeLabel = formatTimeLimit(localSettings.timeLimitSeconds);
  const moveLimitLabel = formatMoveLimit(localSettings.moveLimitMode);

  // ── Special states ───────────────────────────────────────────────────────────

  if (roomClosed) {
    return (
      <div className="select-screen">
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 10, color: 'var(--red)', marginBottom: 12 }}>Room Closed</div>
          <div style={{ fontSize: 8, color: 'var(--text-dim)', marginBottom: 24 }}>
            The host has closed this room.
          </div>
          <PixelButton variant="ghost" onClick={onLeave}>Back to Menu</PixelButton>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="select-screen">
        <div className="online-connecting">
          <div className="gen-spinner" style={{ fontSize: 28, marginBottom: 16 }}>♞</div>
          <div style={{ fontSize: 9, color: 'var(--yellow)' }}>Connecting…</div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="select-screen">
        <h1 className="select-title">Room Lobby</h1>
        <div className="online-connecting">
          <div className="gen-spinner" style={{ fontSize: 36, marginBottom: 16 }}>♞</div>
          <div style={{ fontSize: 10, color: 'var(--yellow)', marginBottom: 8 }}>
            {isHost ? 'Generating puzzle…' : 'Host is generating the puzzle…'}
          </div>
          <div style={{ fontSize: 7, color: 'var(--text-dim)' }}>
            {isHost
              ? 'Hold on — this may take a few seconds'
              : 'Please wait — the puzzle will appear shortly'}
          </div>
        </div>
        {error && <div className="online-error" style={{ marginTop: 16 }}>{error}</div>}
        <div style={{ position: 'fixed', bottom: 20, left: 20 }}>
          <PixelButton variant="danger" className="btn-compact" onClick={handleLeave}>Leave</PixelButton>
        </div>
      </div>
    );
  }

  // ── Main lobby render ────────────────────────────────────────────────────────

  const playerSlots = [
    { label: 'You',      data: localPlayerData, role: myRole as 'host' | 'guest' },
    { label: 'Opponent', data: opponentData,     role: (myRole === 'host' ? 'guest' : 'host') as 'host' | 'guest' },
  ];

  return (
    <div className="select-screen">
      <h1 className="select-title">Room Lobby</h1>

      {/* Room code */}
      <div className="panel online-code-panel">
        <div style={{ fontSize: 8, color: 'var(--text-dim)', marginBottom: 8 }}>Room Code</div>
        <div className="online-code-display">{roomCode}</div>
        <div style={{ marginTop: 12 }}>
          <PixelButton variant="secondary" className="btn-compact" onClick={handleCopyCode}>
            {copied ? '✓ Copied!' : 'Copy Code'}
          </PixelButton>
        </div>
        <div style={{ fontSize: 7, color: 'var(--text-dim)', marginTop: 8 }}>
          Share this code with a friend
        </div>
      </div>

      {/* Players */}
      <div className="online-players-row">
        {playerSlots.map(({ label, data, role }, i) => (
          <div key={label} className="panel online-player-card">
            {data ? (
              <>
                <div style={{ fontSize: 8, color: 'var(--text-dim)', marginBottom: 6 }}>{label}</div>
                <div className="online-player-name">{data.name}</div>
                <div style={{ fontSize: 7, color: 'var(--text-dim)', fontWeight: 'normal', marginBottom: 4 }}>
                  {role === 'host' ? 'Host' : 'Guest'}
                </div>
                <div style={{
                  fontSize: 7, marginTop: 10,
                  color: isPlayerOnline(data) ? 'var(--green)' : 'var(--red)',
                }}>
                  {isPlayerOnline(data) ? '● Online' : '○ Offline'}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 8, color: 'var(--text-dim)', marginBottom: 6 }}>
                  {label}
                </div>
                {i === 1 ? (
                  <>
                    <div className="gen-spinner" style={{ fontSize: 22 }}>♞</div>
                    <div style={{ fontSize: 7, color: 'var(--text-dim)', marginTop: 8 }}>Waiting…</div>
                  </>
                ) : (
                  <div style={{ fontSize: 8, color: 'var(--text-dim)' }}>Loading…</div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Score banner — visible after at least one round */}
      {room.score && room.score.totalRounds > 0 && (() => {
        const hostName = room.players.host.name;
        const guestName = room.players.guest?.name ?? 'Guest';
        return (
          <div className="online-score-banner">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 6, color: 'var(--text-dim)', marginBottom: 2 }}>{hostName}</span>
              <span style={{ fontSize: 16, color: 'var(--yellow)', textShadow: '2px 2px 0 #000' }}>
                {room.score.hostWins}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>—</span>
              {room.score.draws > 0 && (
                <span style={{ fontSize: 6, color: 'var(--text-dim)' }}>
                  {room.score.draws} draw{room.score.draws !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 6, color: 'var(--text-dim)', marginBottom: 2 }}>{guestName}</span>
              <span style={{ fontSize: 16, color: 'var(--yellow)', textShadow: '2px 2px 0 #000' }}>
                {room.score.guestWins}
              </span>
            </div>
          </div>
        );
      })()}

      {/* Mini round history */}
      {rounds.length > 0 && !isCountdown && (
        <div className="online-round-history" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 7, color: 'var(--text-dim)', marginBottom: 6 }}>
            Round History
          </div>
          {rounds.slice(-3).map(r => {
            const myWon = r.winnerUid === playerId;
            return (
              <div key={r.roundNumber} className="online-round-item">
                <span style={{ color: 'var(--text-dim)', minWidth: 44 }}>Rd {r.roundNumber}</span>
                <span style={{
                  minWidth: 72,
                  color: r.winnerRole === 'draw' ? 'var(--text-dim)' : myWon ? 'var(--green)' : 'var(--red)',
                }}>
                  {r.winnerRole === 'draw' ? 'Draw' : myWon ? 'You won' : `${r.winnerName} won`}
                </span>
                <span style={{ color: 'var(--text-dim)' }}>
                  {r.resultReason?.replace(/_/g, ' ')}
                </span>
                {r.optimalMoves !== null && (
                  <span style={{ marginLeft: 'auto', color: 'var(--yellow)', fontSize: 6 }}>
                    opt:{r.optimalMoves}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Opponent disconnect notice */}
      {!isCountdown && !isGenerating && opponentData && !isPlayerOnline(opponentData) && (
        <div style={{ textAlign: 'center', fontSize: 7, marginBottom: 8,
          color: opponentData.leftRoom ? 'var(--red)' : 'var(--yellow)' }}>
          {opponentData.leftRoom ? '✗ Opponent left the room' : '⚠ Opponent disconnected'}
        </div>
      )}

      {/* Match settings panel */}
      {!isCountdown && (
        <div className="panel online-settings-panel online-settings-simple">
          <div className="settings-simple-header">
            <div>
              <div className="settings-eyebrow">{isHost ? 'Host setup' : 'Match setup'}</div>
              <div className="settings-title">Choose the match vibe</div>
            </div>
            {settingsUpdating && <span className="settings-saving-pill">Saving…</span>}
          </div>

          <div className="settings-summary-strip" aria-label="Current match settings">
            <span>{activePreset ? activePreset.title : 'Custom'}</span>
            <span>{difficultyLabel}</span>
            <span>{boardLabel}</span>
            <span>{roundLabel}</span>
            <span>{timeLabel}</span>
          </div>

          {isHost ? (
            <>
              <div className="settings-preset-grid">
                {MATCH_PRESETS.map(preset => {
                  const isActive = sameSettings(localSettings, preset.settings);
                  return (
                    <button
                      key={preset.id}
                      className={`settings-preset-card${isActive ? ' active' : ''}`}
                      onClick={() => handleSettingChange(preset.settings)}
                      disabled={!settingsEditable}
                      type="button"
                    >
                      <span className="settings-preset-badge">{preset.badge}</span>
                      <strong>{preset.title}</strong>
                      <small>{preset.subtitle}</small>
                    </button>
                  );
                })}
              </div>

              <div className="quick-tune-card">
                <div className="quick-tune-row">
                  <span>Difficulty</span>
                  <div className="settings-pill-row compact">
                    {ALL_DIFFICULTIES.map(d => (
                      <button
                        key={d}
                        className={`settings-pill${localSettings.difficulty === d ? ' active' : ''}`}
                        onClick={() => handleSettingChange({ difficulty: d })}
                        disabled={!settingsEditable}
                        type="button"
                      >
                        {d === 'Very Hard' ? 'V. Hard' : d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="quick-tune-row">
                  <span>Board</span>
                  <div className="settings-pill-row">
                    {BOARD_SIZES.map(([key, cfg]) => (
                      <button
                        key={key}
                        className={`settings-pill${localSettings.boardSize === key ? ' active' : ''}`}
                        onClick={() => handleSettingChange({ boardSize: key })}
                        disabled={!settingsEditable}
                        type="button"
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="quick-tune-row">
                  <span>Rounds</span>
                  <div className="settings-pill-row">
                    {ROUNDS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        className={`settings-pill${localSettings.rounds === opt.value ? ' active' : ''}`}
                        onClick={() => handleSettingChange({ rounds: opt.value })}
                        disabled={!settingsEditable}
                        type="button"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                className="settings-advanced-toggle"
                onClick={() => setShowAdvancedSettings(v => !v)}
                type="button"
              >
                <span>{showAdvancedSettings ? 'Hide advanced rules' : 'Advanced rules'}</span>
                <small>{modeLabel} · {timeLabel} · {moveLimitLabel}</small>
              </button>

              {showAdvancedSettings && (
                <div className="settings-advanced-card">
                  <div className="quick-tune-row">
                    <span>Turn rule</span>
                    <div className="settings-pill-row">
                      {(['no-turns', 'with-turns'] as const).map(m => (
                        <button
                          key={m}
                          className={`settings-pill${localSettings.mode === m ? ' active' : ''}`}
                          onClick={() => handleSettingChange({ mode: m })}
                          disabled={!settingsEditable}
                          type="button"
                        >
                          {m === 'no-turns' ? 'No turns' : 'With turns'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="quick-tune-row">
                    <span>Timer</span>
                    <div className="settings-pill-row compact">
                      {TIME_LIMIT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          className={`settings-pill${localSettings.timeLimitSeconds === opt.value ? ' active' : ''}`}
                          onClick={() => handleSettingChange({ timeLimitSeconds: opt.value })}
                          disabled={!settingsEditable}
                          type="button"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="quick-tune-row">
                    <span>Move cap</span>
                    <div className="settings-pill-row compact">
                      {MOVE_LIMIT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          className={`settings-pill${localSettings.moveLimitMode === opt.value ? ' active' : ''}`}
                          onClick={() => handleSettingChange({ moveLimitMode: opt.value })}
                          disabled={!settingsEditable}
                          type="button"
                        >
                          {opt.label.replace('Optimal', 'Opt.')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="settings-hint">
                    Advanced rules are optional. Move cap is calculated after generation from the optimal solution length.
                  </p>
                </div>
              )}

              {!settingsEditable && (
                <div className="settings-lock-note">Settings are locked while the match is starting.</div>
              )}
            </>
          ) : (
            <div className="guest-settings-card">
              <div className="guest-settings-title">Host selected</div>
              <div className="guest-settings-grid">
                <span>Mode <strong>{modeLabel}</strong></span>
                <span>Difficulty <strong>{difficultyLabel}</strong></span>
                <span>Board <strong>{boardLabel}</strong></span>
                <span>Rounds <strong>{roundLabel}</strong></span>
                <span>Timer <strong>{timeLabel}</strong></span>
                <span>Moves <strong>{moveLimitLabel}</strong></span>
              </div>
              <div className={`guest-settings-note${settingsNotice ? ' active' : ''}`}>
                {settingsNotice ? 'Host updated the setup' : 'Waiting for the host to start'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Countdown or action area */}
      {isCountdown ? (
        <div className="online-countdown-display">
          <div className="online-countdown-number">{countdown}</div>
          <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>Get ready!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 8 }}>
          {isHost ? (
            <>
              {!opponentData || !isPlayerOnline(opponentData) ? (
                <div style={{ fontSize: 8, color: 'var(--text-dim)', textAlign: 'center', marginBottom: 4 }}>
                  Waiting for opponent to join…
                </div>
              ) : (
                <div style={{ fontSize: 7, color: 'var(--text-dim)', marginBottom: 4 }}>
                  {opponentData.name} has joined. Configure settings above, then start when ready.
                </div>
              )}
              <PixelButton
                variant="primary"
                onClick={handleStartMatch}
                disabled={!canStartMatch}
              >
                {settingsUpdating ? 'Updating…' : 'Start Match'}
              </PixelButton>
            </>
          ) : (
            <div style={{ fontSize: 8, color: 'var(--text-dim)', textAlign: 'center' }}>
              Waiting for host to start the match…
            </div>
          )}
        </div>
      )}

      {error && <div className="online-error" style={{ marginTop: 16 }}>{error}</div>}

      <div style={{ position: 'fixed', bottom: 20, left: 20 }}>
        <PixelButton variant="danger" className="btn-compact" onClick={handleLeave}>Leave</PixelButton>
      </div>
      <div style={{ position: 'fixed', bottom: 20, right: 20 }}>
        <div style={{ fontSize: 7, color: 'var(--text-dim)' }}>{playerName}</div>
      </div>
    </div>
  );
}
