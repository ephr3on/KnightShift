/**
 * onlineRoomService — Firebase Firestore operations for the online race mode.
 *
 * Data model
 * ──────────
 *   rooms/{roomCode}            ← ONE document per room, watched by ONE listener
 *   rooms/{roomCode}/rounds/{N} ← per-round result history (result screen only)
 *
 * Write events (only important game events — no timer ticks, hover state, etc.)
 * ────────────
 *   createRoom              room created
 *   joinRoom                guest joined; guestId + players.guest set
 *   updatePuzzleConfig      host changes settings
 *   hostStartMatch          host clicks Start; status → 'generating'
 *   saveSeedAndStartCountdown  seed stored; status → 'countdown'
 *   startGame               countdown fires; status → 'playing', timeLimitStartedAt
 *   updateMoveCount         every valid move (players.{role}.moveCount + lastMove)
 *   submitSolved            solver wins; finalizeRound called
 *   submitMoveLimitReached  player exhausted moves; finalizeRound when both done
 *   resolveTimeLimit        time expired; finalizeRound
 *   forfeitAndLeave         intentional leave; opponent wins
 *   requestRematch          sets rematch flag
 *   prepareNextRound        host triggers next round
 *   returnToLobby           back to lobby preserving score
 *   leaveRoom / leaveWaitingRoom
 */

import {
  doc,
  collection,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  deleteField,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  OnlineRoom,
  OnlinePlayerData,
  OnlinePlayers,
  RoomStatus,
  RoomScore,
  RoundResult,
  MoveLimitMode,
  OnlineMatchSettings,
  Difficulty,
} from './types';
import { DEFAULT_MATCH_SETTINGS, DEFAULT_ROOM_SCORE } from './types';

const DEV = import.meta.env.DEV;

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 5; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return code;
}

// ─── Document references ───────────────────────────────────────────────────

const roomRef   = (code: string) => doc(db, 'rooms', code);
const roundRef  = (code: string, n: number) => doc(db, 'rooms', code, 'rounds', String(n));
const roundsCol = (code: string) => collection(db, 'rooms', code, 'rounds');

// ─── Private helpers ───────────────────────────────────────────────────────

function computeMoveLimit(optimalMoves: number, mode: MoveLimitMode): number | null {
  switch (mode) {
    case 'optimal+2':  return optimalMoves + 2;
    case 'optimal+5':  return optimalMoves + 5;
    case 'optimal+10': return optimalMoves + 10;
    default:           return null;
  }
}

function blankPlayer(name: string): OnlinePlayerData {
  return { name, moveCount: 0, solved: false, timeMs: 0, connected: true, moveLimitReached: false };
}

function resetPlayer(p: OnlinePlayerData): OnlinePlayerData {
  return { ...p, moveCount: 0, solved: false, timeMs: 0, connected: true, moveLimitReached: false, leftRoom: false };
}

/**
 * Determine match winner from embedded player data.
 * Priority: solved > not solved → faster time → fewer moves → draw (null).
 */
function determineWinner(
  host: OnlinePlayerData,
  guest: OnlinePlayerData,
  hostId: string,
  guestId: string,
): { id: string; name: string } | null {
  const h = { id: hostId, data: host };
  const g = { id: guestId, data: guest };

  if (host.solved && !guest.solved) return { id: h.id, name: host.name };
  if (guest.solved && !host.solved) return { id: g.id, name: guest.name };

  if (host.solved && guest.solved) {
    if (host.timeMs !== guest.timeMs)
      return host.timeMs < guest.timeMs ? { id: h.id, name: host.name } : { id: g.id, name: guest.name };
    if (host.moveCount !== guest.moveCount)
      return host.moveCount < guest.moveCount ? { id: h.id, name: host.name } : { id: g.id, name: guest.name };
    return null; // Perfect draw
  }

  // Neither solved — fewer moves wins
  if (host.moveCount !== guest.moveCount)
    return host.moveCount < guest.moveCount ? { id: h.id, name: host.name } : { id: g.id, name: guest.name };
  return null;
}

/**
 * Atomic round finalization (transaction).
 * Sets status → 'finished', records winner, increments score.
 * Only one client's transaction commits; others are no-ops (status guard).
 */
async function finalizeRound(
  roomCode: string,
  winnerId: string,
  winnerName: string,
  reason: NonNullable<OnlineRoom['resultReason']>,
): Promise<boolean> {
  let finalized = false;
  await runTransaction(db, async tx => {
    const snap = await tx.get(roomRef(roomCode));
    if (!snap.exists()) return;
    const room = snap.data() as OnlineRoom;
    if (room.status !== 'playing' && room.status !== 'countdown') return;

    const winnerRole =
      winnerId === '' ? 'draw'
      : winnerId === room.hostId ? 'host'
      : 'guest';

    const cur = room.score ?? DEFAULT_ROOM_SCORE;
    const newScore: RoomScore = {
      hostWins:    cur.hostWins    + (winnerRole === 'host'  ? 1 : 0),
      guestWins:   cur.guestWins   + (winnerRole === 'guest' ? 1 : 0),
      draws:       cur.draws       + (winnerRole === 'draw'  ? 1 : 0),
      totalRounds: cur.totalRounds + 1,
    };

    if (DEV) console.log(`[Firestore write] finalizeRound reason=${reason} winner=${winnerId || 'draw'}`);
    tx.update(roomRef(roomCode), {
      status:       'finished' as RoomStatus,
      winnerId,
      winnerName,
      resultReason: reason,
      score:        newScore,
      updatedAt:    serverTimestamp(),
    });
    finalized = true;
  });
  return finalized;
}

/** Write round result to subcollection (idempotent — both clients may call). */
async function recordRoundResult(roomCode: string, room: OnlineRoom): Promise<void> {
  const roundNum = room.currentRound ?? 1;
  const h = room.players.host;
  const g = room.players.guest;

  const toStats = (p: OnlinePlayerData | undefined, id: string): RoundResult['hostStats'] => ({
    playerId: id,
    name: p?.name ?? '',
    moves: p?.moveCount ?? 0,
    elapsedSeconds: p ? Math.round(p.timeMs / 1000) : 0,
    solved: p?.solved ?? false,
    moveLimitReached: p?.moveLimitReached ?? false,
  });

  const result: Omit<RoundResult, 'endedAt'> = {
    roundNumber: roundNum,
    winnerUid:  room.winnerId  ?? '',
    winnerName: room.winnerName ?? '',
    winnerRole:
      (room.winnerId ?? '') === '' ? 'draw'
      : room.winnerId === room.hostId ? 'host'
      : 'guest',
    resultReason: room.resultReason ?? 'solved',
    hostStats:  toStats(h, room.hostId),
    guestStats: toStats(g, room.guestId ?? ''),
    optimalMoves: room.puzzleOptimalMoves ?? null,
    settings: {
      difficulty:       room.puzzleDifficulty ?? room.puzzleConfig.difficulty,
      boardSize:        room.puzzleConfig.boardSize,
      mode:             room.puzzleConfig.mode,
      timeLimitSeconds: room.puzzleConfig.timeLimitSeconds,
      moveLimitMode:    room.puzzleConfig.moveLimitMode,
      moveLimit:        room.moveLimit ?? null,
    },
  };
  if (DEV) console.log(`[Firestore write] recordRoundResult round=${roundNum}`);
  await setDoc(roundRef(roomCode, roundNum), { ...result, endedAt: serverTimestamp() }, { merge: true });
}

/** Finalize then record. Both clients may call — both operations are idempotent. */
async function finalizeAndRecord(
  roomCode: string,
  winnerId: string,
  winnerName: string,
  reason: NonNullable<OnlineRoom['resultReason']>,
): Promise<void> {
  await finalizeRound(roomCode, winnerId, winnerName, reason);
  const snap = await getDoc(roomRef(roomCode));
  if (snap.exists() && (snap.data() as OnlineRoom).status === 'finished') {
    await recordRoundResult(roomCode, snap.data() as OnlineRoom).catch(console.error);
  }
}

// ─── Room lifecycle ────────────────────────────────────────────────────────

export async function createRoom(playerName: string, playerId: string): Promise<string> {
  let code = '';
  for (let i = 0; i < 10; i++) {
    const c = generateRoomCode();
    if (!(await getDoc(roomRef(c))).exists()) { code = c; break; }
  }
  if (!code) throw new Error('Could not generate a unique room code. Please try again.');

  const room: OnlineRoom = {
    roomCode: code,
    hostId: playerId,
    status: 'waiting',
    createdAt: serverTimestamp(),
    puzzleConfig: DEFAULT_MATCH_SETTINGS,
    settingsLocked: false,
    players: { host: blankPlayer(playerName || 'Player 1') },
    currentRound: 1,
    score: DEFAULT_ROOM_SCORE,
    rematch: { hostWantsRematch: false, guestWantsRematch: false, hostWantsNewMatch: false, guestWantsNewMatch: false },
  };
  if (DEV) console.log(`[Firestore write] createRoom code=${code}`);
  await setDoc(roomRef(code), room);
  return code;
}

export async function joinRoom(
  roomCode: string,
  playerName: string,
  playerId: string,
): Promise<void> {
  const upper = roomCode.toUpperCase().trim();
  const snap = await getDoc(roomRef(upper));
  if (!snap.exists()) throw new Error('Room not found. Check the code and try again.');

  const room = snap.data() as OnlineRoom;
  if (room.status === 'closed')   throw new Error('This room has been closed by the host.');
  if (room.status === 'finished') throw new Error('This match is already over.');
  if (
    room.status === 'playing' ||
    room.status === 'countdown' ||
    room.status === 'generating'
  ) throw new Error('A match is already in progress in this room.');

  if (room.guestId && room.guestId !== playerId)
    throw new Error('Room is full. Maximum 2 players.');

  if (DEV) console.log(`[Firestore write] joinRoom code=${upper}`);
  await updateDoc(roomRef(upper), {
    guestId: playerId,
    'players.guest': blankPlayer(playerName || 'Player 2'),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Mark the player disconnected.
 * Call ONLY from `beforeunload` — never from useEffect cleanup
 * (React StrictMode double-invokes cleanups in dev).
 */
export async function leaveRoom(roomCode: string, role: 'host' | 'guest'): Promise<void> {
  if (DEV) console.log(`[Firestore write] leaveRoom role=${role}`);
  try {
    await updateDoc(roomRef(roomCode), {
      [`players.${role}.connected`]: false,
      [`players.${role}.lastSeen`]: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch { /* ignore — room may already be gone */ }
}

/** Leave from the waiting lobby. Host closes the room; guest disconnects. */
export async function leaveWaitingRoom(
  roomCode: string,
  role: 'host' | 'guest',
): Promise<void> {
  if (role === 'host') {
    if (DEV) console.log(`[Firestore write] leaveWaitingRoom host close code=${roomCode}`);
    try {
      await updateDoc(roomRef(roomCode), {
        status: 'closed' as RoomStatus,
        updatedAt: serverTimestamp(),
      });
    } catch { /* ignore */ }
  } else {
    await leaveRoom(roomCode, 'guest');
  }
}

// ─── Lobby settings ────────────────────────────────────────────────────────

export async function updatePuzzleConfig(
  roomCode: string,
  config: OnlineMatchSettings,
): Promise<void> {
  if (DEV) console.log('[Firestore write] updatePuzzleConfig');
  await updateDoc(roomRef(roomCode), {
    puzzleConfig: config,
    updatedAt: serverTimestamp(),
  });
}

// ─── Match start flow ──────────────────────────────────────────────────────

export async function hostStartMatch(roomCode: string): Promise<void> {
  if (DEV) console.log('[Firestore write] hostStartMatch');
  await runTransaction(db, async tx => {
    const snap = await tx.get(roomRef(roomCode));
    if (!snap.exists()) throw new Error('Room not found.');
    if ((snap.data() as OnlineRoom).status !== 'waiting') return;
    tx.update(roomRef(roomCode), {
      status: 'generating' as RoomStatus,
      settingsLocked: true,
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * Save the puzzle seed and transition to countdown.
 * Stores only the short attempt seed string — not large board arrays.
 * The guest reproduces the identical puzzle locally via reproducePuzzle().
 */
export async function saveSeedAndStartCountdown(
  roomCode: string,
  puzzleSeed: string,
  puzzleOptimalMoves: number,
  puzzleDifficulty: Difficulty,
): Promise<void> {
  if (DEV) console.log(`[Firestore write] saveSeedAndStartCountdown seed=${puzzleSeed}`);
  await runTransaction(db, async tx => {
    const snap = await tx.get(roomRef(roomCode));
    if (!snap.exists()) return;
    if ((snap.data() as OnlineRoom).status !== 'generating') return;
    tx.update(roomRef(roomCode), {
      status: 'countdown' as RoomStatus,
      puzzleSeed,
      puzzleOptimalMoves,
      puzzleDifficulty,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function generationFailed(roomCode: string): Promise<void> {
  if (DEV) console.log('[Firestore write] generationFailed');
  try {
    await updateDoc(roomRef(roomCode), {
      status: 'waiting' as RoomStatus,
      settingsLocked: false,
      updatedAt: serverTimestamp(),
    });
  } catch { /* ignore */ }
}

export async function startGame(roomCode: string): Promise<void> {
  if (DEV) console.log('[Firestore write] startGame');
  await runTransaction(db, async tx => {
    const snap = await tx.get(roomRef(roomCode));
    if (!snap.exists()) return;
    const room = snap.data() as OnlineRoom;
    if (room.status !== 'countdown') return;

    const moveLimit = computeMoveLimit(
      room.puzzleOptimalMoves ?? 0,
      room.puzzleConfig.moveLimitMode,
    );

    tx.update(roomRef(roomCode), {
      status: 'playing' as RoomStatus,
      moveLimit: moveLimit ?? null,
      timeLimitStartedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

// ─── In-match writes ───────────────────────────────────────────────────────

/**
 * Written on every valid move.
 * Updates the player's move count and lastMove in a single document write.
 * NOT written for: invalid moves, selected squares, timer ticks, renders.
 */
export async function updateMoveCount(
  roomCode: string,
  role: 'host' | 'guest',
  moveCount: number,
  from: string,
  to: string,
): Promise<void> {
  if (DEV) console.log(`[Firestore write] move role=${role} #${moveCount} ${from}→${to}`);
  try {
    await updateDoc(roomRef(roomCode), {
      [`players.${role}.moveCount`]: moveCount,
      lastMove: { role, from, to, moveNumber: moveCount, ts: serverTimestamp() },
      updatedAt: serverTimestamp(),
    });
  } catch { /* non-critical — opponent will sync on next write */ }
}

export async function submitSolved(
  roomCode: string,
  role: 'host' | 'guest',
  playerName: string,
  moveCount: number,
  timeMs: number,
  playerId: string,
): Promise<void> {
  if (DEV) console.log(`[Firestore write] submitSolved role=${role} moves=${moveCount}`);
  await updateDoc(roomRef(roomCode), {
    [`players.${role}.solved`]: true,
    [`players.${role}.moveCount`]: moveCount,
    [`players.${role}.timeMs`]: timeMs,
    updatedAt: serverTimestamp(),
  });
  await finalizeAndRecord(roomCode, playerId, playerName, 'solved');
}

export async function submitMoveLimitReached(
  roomCode: string,
  role: 'host' | 'guest',
  moveCount: number,
  timeMs: number,
): Promise<void> {
  if (DEV) console.log(`[Firestore write] submitMoveLimitReached role=${role}`);
  await updateDoc(roomRef(roomCode), {
    [`players.${role}.moveLimitReached`]: true,
    [`players.${role}.moveCount`]: moveCount,
    [`players.${role}.timeMs`]: timeMs,
    updatedAt: serverTimestamp(),
  });

  const snap = await getDoc(roomRef(roomCode));
  if (!snap.exists()) return;
  const room = snap.data() as OnlineRoom;
  if (!room.players.guest) return;

  const h = room.players.host;
  const g = room.players.guest;
  if (!(h.solved || h.moveLimitReached) || !(g.solved || g.moveLimitReached)) return;

  const winner = determineWinner(h, g, room.hostId, room.guestId ?? '');
  const anySolved = h.solved || g.solved;
  await finalizeAndRecord(
    roomCode, winner?.id ?? '', winner?.name ?? '', anySolved ? 'solved' : 'move_limit',
  );
}

/**
 * Called by BOTH clients on time expiry.
 * 500ms delay lets both write final stats before winner determination.
 * Transaction ensures only one outcome is written.
 */
export async function resolveTimeLimit(
  roomCode: string,
  role: 'host' | 'guest',
  timeMs: number,
  moveCount: number,
): Promise<void> {
  if (DEV) console.log(`[Firestore write] resolveTimeLimit role=${role}`);
  try {
    await updateDoc(roomRef(roomCode), {
      [`players.${role}.moveCount`]: moveCount,
      [`players.${role}.timeMs`]: timeMs,
      updatedAt: serverTimestamp(),
    });
  } catch { /* ignore */ }

  await new Promise(r => setTimeout(r, 500));

  const snap = await getDoc(roomRef(roomCode));
  if (!snap.exists()) return;
  const room = snap.data() as OnlineRoom;
  if (!room.players.guest) return;

  const winner = determineWinner(
    room.players.host, room.players.guest, room.hostId, room.guestId ?? '',
  );
  await finalizeAndRecord(roomCode, winner?.id ?? '', winner?.name ?? '', 'time_limit');
}

export async function forfeitAndLeave(roomCode: string, role: 'host' | 'guest'): Promise<void> {
  if (DEV) console.log(`[Firestore write] forfeitAndLeave role=${role}`);
  try {
    await updateDoc(roomRef(roomCode), {
      [`players.${role}.connected`]: false,
      updatedAt: serverTimestamp(),
    });
  } catch { /* ignore */ }

  const snap = await getDoc(roomRef(roomCode));
  if (!snap.exists()) return;
  const room = snap.data() as OnlineRoom;

  const oppRole = role === 'host' ? 'guest' : 'host';
  const opp = room.players[oppRole];
  const oppId = role === 'host' ? (room.guestId ?? '') : room.hostId;

  await finalizeAndRecord(roomCode, oppId, opp?.name ?? '', 'forfeit');
}

export async function claimVictoryAfterDisconnect(
  roomCode: string,
  myId: string,
  myName: string,
): Promise<void> {
  if (DEV) console.log('[Firestore write] claimVictoryAfterDisconnect');
  await finalizeAndRecord(roomCode, myId, myName, 'opponent_left');
}

// ─── Rematch flow ──────────────────────────────────────────────────────────

/** Signal "Rematch Same Puzzle" — clears any conflicting "New Match" signal for this player. */
export async function requestRematch(roomCode: string, role: 'host' | 'guest'): Promise<void> {
  const rematchField  = role === 'host' ? 'rematch.hostWantsRematch'  : 'rematch.guestWantsRematch';
  const newMatchField = role === 'host' ? 'rematch.hostWantsNewMatch' : 'rematch.guestWantsNewMatch';
  if (DEV) console.log(`[Firestore write] requestRematch role=${role}`);
  await updateDoc(roomRef(roomCode), {
    [rematchField]:  true,
    [newMatchField]: false,
    updatedAt: serverTimestamp(),
  });
}

/** Signal "New Match" — generates a fresh puzzle with the same settings. Clears any "Rematch" signal. */
export async function requestNewMatch(roomCode: string, role: 'host' | 'guest'): Promise<void> {
  const rematchField  = role === 'host' ? 'rematch.hostWantsRematch'  : 'rematch.guestWantsRematch';
  const newMatchField = role === 'host' ? 'rematch.hostWantsNewMatch' : 'rematch.guestWantsNewMatch';
  if (DEV) console.log(`[Firestore write] requestNewMatch role=${role}`);
  await updateDoc(roomRef(roomCode), {
    [rematchField]:  false,
    [newMatchField]: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Host-only: replay the EXACT same puzzle (same seed, same config).
 * Resets player state and transitions directly to 'countdown' — no new generation.
 * Both clients reproduce the puzzle locally from the unchanged puzzleSeed.
 */
export async function prepareRematch(roomCode: string): Promise<void> {
  if (DEV) console.log('[Firestore write] prepareRematch (same puzzle, same seed)');
  await runTransaction(db, async tx => {
    const snap = await tx.get(roomRef(roomCode));
    if (!snap.exists()) return;
    const room = snap.data() as OnlineRoom;
    if (room.status !== 'finished') return;

    const resetPlayers: OnlinePlayers = {
      host: resetPlayer(room.players.host),
      ...(room.players.guest ? { guest: resetPlayer(room.players.guest) } : {}),
    };

    tx.update(roomRef(roomCode), {
      status:         'countdown' as RoomStatus,
      settingsLocked: true,
      players:        resetPlayers,
      'rematch.hostWantsRematch':  false,
      'rematch.guestWantsRematch': false,
      'rematch.hostWantsNewMatch':  false,
      'rematch.guestWantsNewMatch': false,
      // puzzleSeed, puzzleOptimalMoves, puzzleDifficulty, puzzleConfig — intentionally kept
      // moveLimit will be recomputed by startGame from the preserved puzzleOptimalMoves
      timeLimitStartedAt: deleteField(),
      winnerId:           deleteField(),
      winnerName:         deleteField(),
      resultReason:       deleteField(),
      lastMove:           deleteField(),
      updatedAt:          serverTimestamp(),
    });
  });
}

/** Host-only: increments round, resets per-round state, transitions to 'generating'. */
export async function prepareNextRound(roomCode: string): Promise<void> {
  if (DEV) console.log('[Firestore write] prepareNextRound');
  await runTransaction(db, async tx => {
    const snap = await tx.get(roomRef(roomCode));
    if (!snap.exists()) return;
    const room = snap.data() as OnlineRoom;
    if (room.status !== 'finished') return;

    const resetPlayers: OnlinePlayers = {
      host: resetPlayer(room.players.host),
      ...(room.players.guest ? { guest: resetPlayer(room.players.guest) } : {}),
    };

    tx.update(roomRef(roomCode), {
      status:       'generating' as RoomStatus,
      settingsLocked: true,
      currentRound: (room.currentRound ?? 1) + 1,
      players:      resetPlayers,
      'rematch.hostWantsRematch':   false,
      'rematch.guestWantsRematch':  false,
      'rematch.hostWantsNewMatch':  false,
      'rematch.guestWantsNewMatch': false,
      puzzleSeed:         deleteField(),
      puzzleOptimalMoves: deleteField(),
      puzzleDifficulty:   deleteField(),
      moveLimit:          deleteField(),
      timeLimitStartedAt: deleteField(),
      winnerId:           deleteField(),
      winnerName:         deleteField(),
      resultReason:       deleteField(),
      lastMove:           deleteField(),
      updatedAt:          serverTimestamp(),
    });
  });
}

/** Return to lobby preserving score, currentRound, and round history. */
export async function returnToLobby(roomCode: string): Promise<void> {
  if (DEV) console.log('[Firestore write] returnToLobby');
  await runTransaction(db, async tx => {
    const snap = await tx.get(roomRef(roomCode));
    if (!snap.exists()) return;
    const room = snap.data() as OnlineRoom;
    if (room.status !== 'finished') return;

    const resetPlayers: OnlinePlayers = {
      host: resetPlayer(room.players.host),
      ...(room.players.guest ? { guest: resetPlayer(room.players.guest) } : {}),
    };

    tx.update(roomRef(roomCode), {
      status:         'waiting' as RoomStatus,
      settingsLocked: false,
      players:        resetPlayers,
      'rematch.hostWantsRematch':   false,
      'rematch.guestWantsRematch':  false,
      'rematch.hostWantsNewMatch':  false,
      'rematch.guestWantsNewMatch': false,
      puzzleSeed:         deleteField(),
      puzzleOptimalMoves: deleteField(),
      puzzleDifficulty:   deleteField(),
      moveLimit:          deleteField(),
      timeLimitStartedAt: deleteField(),
      winnerId:           deleteField(),
      winnerName:         deleteField(),
      resultReason:       deleteField(),
      lastMove:           deleteField(),
      updatedAt:          serverTimestamp(),
      // score, currentRound, puzzleConfig preserved
    });
  });
}

// ─── Presence & session ────────────────────────────────────────────────────

/** Read milliseconds from a Firestore Timestamp or plain {seconds} object. */
function tsMillis(ts: unknown): number | null {
  if (!ts || typeof ts !== 'object') return null;
  const obj = ts as Record<string, unknown>;
  if (typeof obj.toMillis === 'function') return (obj.toMillis as () => number)();
  if (typeof obj.seconds === 'number') return obj.seconds * 1000;
  return null;
}

/** True if the player is connected and their heartbeat is recent (within 20 s). */
export function isPlayerOnline(player: OnlinePlayerData): boolean {
  if (!player.connected) return false;
  if (player.lastSeen === undefined || player.lastSeen === null) return true;
  const ms = tsMillis(player.lastSeen);
  return ms === null ? true : Date.now() - ms < 20_000;
}

export async function markPlayerConnected(
  roomCode: string,
  role: 'host' | 'guest',
): Promise<void> {
  if (DEV) console.log(`[Firestore write] markPlayerConnected role=${role}`);
  try {
    await updateDoc(roomRef(roomCode), {
      [`players.${role}.connected`]: true,
      [`players.${role}.lastSeen`]: serverTimestamp(),
      [`players.${role}.leftRoom`]: false,
      updatedAt: serverTimestamp(),
    });
  } catch { /* ignore */ }
}

export async function markPlayerDisconnected(
  roomCode: string,
  role: 'host' | 'guest',
): Promise<void> {
  if (DEV) console.log(`[Firestore write] markPlayerDisconnected role=${role}`);
  try {
    await updateDoc(roomRef(roomCode), {
      [`players.${role}.connected`]: false,
      [`players.${role}.lastSeen`]: serverTimestamp(),
    });
  } catch { /* ignore */ }
}

/** Intentional leave — sets leftRoom: true so the opponent sees "left" vs "disconnected". */
export async function markPlayerLeftRoom(
  roomCode: string,
  role: 'host' | 'guest',
): Promise<void> {
  if (DEV) console.log(`[Firestore write] markPlayerLeftRoom role=${role}`);
  try {
    await updateDoc(roomRef(roomCode), {
      [`players.${role}.connected`]: false,
      [`players.${role}.leftRoom`]: true,
      [`players.${role}.lastSeen`]: serverTimestamp(),
    });
  } catch { /* ignore */ }
}

/**
 * Write connected=true + lastSeen every 8 seconds.
 * Returns a cleanup function that clears the interval.
 * Call ONLY from component effects — NOT from useEffect cleanup.
 */
export function startPresenceHeartbeat(
  roomCode: string,
  role: 'host' | 'guest',
): () => void {
  const beat = () => {
    if (DEV) console.log(`[Firestore write] heartbeat role=${role}`);
    updateDoc(roomRef(roomCode), {
      [`players.${role}.connected`]: true,
      [`players.${role}.lastSeen`]: serverTimestamp(),
    }).catch(() => {});
  };
  beat(); // immediate first beat
  const id = setInterval(beat, 8_000);
  return () => clearInterval(id);
}

/**
 * Fetch the room document once; return it if the player is still a participant,
 * null if the room is gone, closed, or the player is not in it.
 */
export async function restoreRoomSession(
  roomCode: string,
  playerId: string,
): Promise<OnlineRoom | null> {
  if (DEV) console.log(`[Firestore] restoreRoomSession code=${roomCode}`);
  try {
    const snap = await getDoc(roomRef(roomCode));
    if (!snap.exists()) return null;
    const room = snap.data() as OnlineRoom;
    if (room.status === 'closed') return null;
    if (room.hostId !== playerId && room.guestId !== playerId) return null;
    return room;
  } catch { return null; }
}

// ─── Realtime subscriptions ────────────────────────────────────────────────

/**
 * Subscribe to the room document.
 * ONE listener covers room status, both players' stats, and match result.
 * No separate players subcollection listener is needed.
 */
export function subscribeToRoom(
  roomCode: string,
  callback: (room: OnlineRoom | null) => void,
): () => void {
  if (DEV) console.log(`[Firestore listen] subscribeToRoom start code=${roomCode}`);
  const unsub = onSnapshot(
    roomRef(roomCode),
    snap => {
      if (DEV) {
        const s = snap.exists() ? (snap.data() as OnlineRoom).status : 'gone';
        console.log(`[Firestore listen] subscribeToRoom update status=${s}`);
      }
      callback(snap.exists() ? (snap.data() as OnlineRoom) : null);
    },
    err => { console.error('[Room listener error]', err); callback(null); },
  );
  return () => {
    if (DEV) console.log(`[Firestore listen] subscribeToRoom unsubscribe code=${roomCode}`);
    unsub();
  };
}

/** Round history subcollection — used on result screen and lobby only. */
export function subscribeToRounds(
  roomCode: string,
  callback: (rounds: RoundResult[]) => void,
): () => void {
  if (DEV) console.log(`[Firestore listen] subscribeToRounds start code=${roomCode}`);
  const unsub = onSnapshot(
    roundsCol(roomCode),
    snap => {
      if (DEV) console.log(`[Firestore listen] subscribeToRounds update count=${snap.size}`);
      callback(
        snap.docs
          .map(d => d.data() as RoundResult)
          .sort((a, b) => a.roundNumber - b.roundNumber),
      );
    },
    err => { console.error('[Rounds listener error]', err); callback([]); },
  );
  return () => {
    if (DEV) console.log(`[Firestore listen] subscribeToRounds unsubscribe code=${roomCode}`);
    unsub();
  };
}
