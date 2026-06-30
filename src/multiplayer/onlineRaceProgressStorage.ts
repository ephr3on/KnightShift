import type { MoveRecord } from '../types';

interface StoredRaceProgress {
  roomCode: string;
  playerId: string;
  puzzleSeed: string;
  moves: MoveRecord[];
  savedAt: number;
}

const KEY = 'knightshift_race_progress';
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

export function saveOnlineRaceProgress(
  roomCode: string,
  playerId: string,
  puzzleSeed: string,
  moves: MoveRecord[],
): void {
  try {
    const data: StoredRaceProgress = { roomCode, playerId, puzzleSeed, moves, savedAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function loadOnlineRaceProgress(
  roomCode: string,
  playerId: string,
  puzzleSeed: string,
): MoveRecord[] | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredRaceProgress;
    if (
      data.roomCode !== roomCode ||
      data.playerId !== playerId ||
      data.puzzleSeed !== puzzleSeed ||
      Date.now() - data.savedAt > MAX_AGE_MS
    ) return null;
    return data.moves;
  } catch { return null; }
}

export function clearOnlineRaceProgress(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
