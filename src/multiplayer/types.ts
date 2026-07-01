import type { PuzzleMode } from '../types';
import type { Difficulty } from '../generator/difficulty';
import type { BoardSize } from '../generator/boardGenerator';

export type { Difficulty, BoardSize };

export type RoomStatus =
  | 'waiting'     // Lobby: host configures settings, guest waits
  | 'generating'  // Host is running the puzzle generator (Web Worker)
  | 'countdown'   // 3-second pre-game countdown
  | 'playing'     // Race in progress
  | 'finished'    // Round ended
  | 'closed';     // Host shut the room

// ---------------------------------------------------------------------------
// Match configuration — edited by host in lobby
// ---------------------------------------------------------------------------

export type MoveLimitMode = 'none' | 'optimal+2' | 'optimal+5' | 'optimal+10';
export type RoundCount = 1 | 3 | 5;

export interface OnlineMatchSettings {
  mode: PuzzleMode;
  difficulty: Difficulty;
  boardSize: BoardSize;
  rounds: RoundCount;
  timeLimitSeconds: number; // 0 = no limit
  moveLimitMode: MoveLimitMode;
}

export const DEFAULT_MATCH_SETTINGS: OnlineMatchSettings = {
  mode: 'no-turns',
  difficulty: 'Medium',
  boardSize: 'classic',
  rounds: 1,
  timeLimitSeconds: 0,
  moveLimitMode: 'none',
};

// ---------------------------------------------------------------------------
// Session score — persists across rematch rounds
// ---------------------------------------------------------------------------

export interface RoomScore {
  hostWins: number;
  guestWins: number;
  draws: number;
  totalRounds: number;
}

export const DEFAULT_ROOM_SCORE: RoomScore = {
  hostWins: 0,
  guestWins: 0,
  draws: 0,
  totalRounds: 0,
};

// ---------------------------------------------------------------------------
// Rematch coordination
// ---------------------------------------------------------------------------

export interface RematchState {
  hostWantsRematch: boolean;
  guestWantsRematch: boolean;
  /** True when the player wants to replay the exact same puzzle (no new seed). */
  hostWantsNewMatch: boolean;
  guestWantsNewMatch: boolean;
}

// ---------------------------------------------------------------------------
// Embedded player data — stored directly in the room document.
// No separate subcollection; one Firestore listener covers everything.
// ---------------------------------------------------------------------------

export interface OnlinePlayerData {
  name: string;
  moveCount: number;
  solved: boolean;
  /** Elapsed milliseconds. Written only on solve / time-limit / move-limit. */
  timeMs: number;
  connected: boolean;
  moveLimitReached: boolean;
  /** serverTimestamp() written by heartbeat — used to detect stale connected flag. */
  lastSeen?: unknown;
  /** True when player clicked a Leave button intentionally (not a browser close). */
  leftRoom?: boolean;
  /** Lobby confirmation. Both players must be ready before the host can start. */
  ready?: boolean;
}

export interface OnlinePlayers {
  host: OnlinePlayerData;
  guest?: OnlinePlayerData; // undefined until a guest joins
}

// ---------------------------------------------------------------------------
// Last move — written on every valid move for opponent display only.
// Kept minimal to reduce document size growth.
// ---------------------------------------------------------------------------

export interface LastMove {
  role: 'host' | 'guest';
  from: string;
  to: string;
  moveNumber: number;
  ts: unknown; // serverTimestamp()
}

// ---------------------------------------------------------------------------
// Round history subcollection: rooms/{code}/rounds/{N}
// ---------------------------------------------------------------------------

export interface PlayerRoundStats {
  playerId: string;
  name: string;
  moves: number;
  elapsedSeconds: number;
  solved: boolean;
  moveLimitReached: boolean;
}

export interface RoundResult {
  roundNumber: number;
  winnerUid: string;   // '' for draw
  winnerName: string;
  winnerRole: 'host' | 'guest' | 'draw';
  resultReason: 'solved' | 'forfeit' | 'opponent_left' | 'room_closed' | 'time_limit' | 'move_limit';
  hostStats: PlayerRoundStats;
  guestStats: PlayerRoundStats;
  optimalMoves: number | null;
  settings: {
    difficulty: string;
    boardSize: string;
    mode: string;
    timeLimitSeconds: number;
    moveLimitMode: string;
    moveLimit: number | null;
  };
  endedAt: unknown;
}

// ---------------------------------------------------------------------------
// Main room document: rooms/{roomCode}
//
// Design goals:
//   • ONE Firestore document per room (no player subcollection during the race)
//   • ONE realtime listener covers room status, both players' stats, and result
//   • Puzzle stored as a short seed string — not as large arrays
//   • Score and rematch fields persist across rematch rounds
// ---------------------------------------------------------------------------

export interface OnlineRoom {
  roomCode: string;
  hostId: string;         // UID of the room creator
  guestId?: string;       // UID of the guest (set on join)
  status: RoomStatus;
  createdAt: unknown;
  updatedAt?: unknown;

  // Professional room metadata
  version?: number;
  createdByName?: string;

  // Puzzle configuration — host edits these before starting
  puzzleConfig: OnlineMatchSettings;
  settingsLocked: boolean;

  // Puzzle identity — set by host after generation, consumed by both clients.
  // Both clients call reproducePuzzle(puzzleSeed, ...) to build the board locally,
  // so no large cell/piece arrays are ever stored in Firestore.
  puzzleSeed?: string;            // "${baseSeed}|${attempt}" — deterministic
  puzzleOptimalMoves?: number;    // needed for move limit + display
  puzzleDifficulty?: Difficulty;  // actual difficulty of the generated puzzle

  // Per-round match state (cleared on rematch / back-to-lobby)
  moveLimit?: number | null;         // null = no limit; computed from config
  timeLimitStartedAt?: unknown;      // serverTimestamp() when status → 'playing'

  // Embedded player data — no subcollection needed
  players: OnlinePlayers;

  // Latest move — written on every valid move for opponent awareness
  lastMove?: LastMove;

  // Result (set when status → 'finished')
  winnerId?: string;     // '' = draw
  winnerName?: string;
  resultReason?: 'solved' | 'forfeit' | 'opponent_left' | 'room_closed' | 'time_limit' | 'move_limit';

  // Session state — persists across rematch rounds
  currentRound: number;
  score: RoomScore;
  rematch: RematchState;
}
