import type { Puzzle, PuzzleMode, SavedPuzzleEntry, DailyResult } from './types';

const SAVED_KEY = 'ks_saved_puzzles';
const DAILY_RESULT_PREFIX = 'ks_daily_result';
const DAILY_PUZZLE_PREFIX = 'ks_daily_puzzle';

// ── Saved Puzzles ─────────────────────────────────────────────────────────────

export function getSavedPuzzles(): SavedPuzzleEntry[] {
  try {
    const data = localStorage.getItem(SAVED_KEY);
    return data ? (JSON.parse(data) as SavedPuzzleEntry[]) : [];
  } catch {
    return [];
  }
}

export function savePuzzle(entry: SavedPuzzleEntry): void {
  const list = getSavedPuzzles();
  const idx = list.findIndex(e => e.id === entry.id);
  if (idx >= 0) {
    list[idx] = entry;
  } else {
    list.unshift(entry);
  }
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

export function deleteSavedPuzzle(id: string): void {
  const list = getSavedPuzzles().filter(e => e.id !== id);
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

export function isSaved(puzzleId: string): boolean {
  return getSavedPuzzles().some(e => e.puzzleId === puzzleId);
}

// ── Classic personal bests (mirror of GameScreen's localStorage key) ──────────

export function getPersonalBest(puzzleId: string): number | null {
  const v = localStorage.getItem(`best_${puzzleId}`);
  return v ? parseInt(v, 10) : null;
}

// ── Daily Puzzle ───────────────────────────────────────────────────────────────

export function getDailyResult(date: string, mode: PuzzleMode): DailyResult | null {
  try {
    const key = `${DAILY_RESULT_PREFIX}_${date}_${mode}`;
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as DailyResult) : null;
  } catch {
    return null;
  }
}

export function saveDailyResult(result: DailyResult): void {
  const key = `${DAILY_RESULT_PREFIX}_${result.date}_${result.mode}`;
  localStorage.setItem(key, JSON.stringify(result));
}

export function getCachedDailyPuzzle(date: string, mode: PuzzleMode): Puzzle | null {
  try {
    const key = `${DAILY_PUZZLE_PREFIX}_${date}_${mode}`;
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as Puzzle) : null;
  } catch {
    return null;
  }
}

export function cacheDailyPuzzle(date: string, mode: PuzzleMode, puzzle: Puzzle): void {
  const key = `${DAILY_PUZZLE_PREFIX}_${date}_${mode}`;
  localStorage.setItem(key, JSON.stringify(puzzle));
}
