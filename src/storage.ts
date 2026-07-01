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

// ── Campaign / Level Journey ─────────────────────────────────────────────────

const CAMPAIGN_PROGRESS_KEY = 'ks_campaign_progress_v1';

export interface CampaignProgress {
  completedLevels: number[];
  bestMovesByLevel: Record<string, number>;
  lastPlayedLevel: number | null;
  updatedAt: string;
}

const EMPTY_CAMPAIGN_PROGRESS: CampaignProgress = {
  completedLevels: [],
  bestMovesByLevel: {},
  lastPlayedLevel: null,
  updatedAt: new Date(0).toISOString(),
};

export function getCampaignProgress(): CampaignProgress {
  try {
    const data = localStorage.getItem(CAMPAIGN_PROGRESS_KEY);
    if (!data) return { ...EMPTY_CAMPAIGN_PROGRESS, bestMovesByLevel: {} };
    const parsed = JSON.parse(data) as Partial<CampaignProgress>;
    const completedLevels = Array.isArray(parsed.completedLevels)
      ? Array.from(new Set(parsed.completedLevels.filter(level => Number.isInteger(level) && level > 0))).sort((a, b) => a - b)
      : [];
    return {
      completedLevels,
      bestMovesByLevel: parsed.bestMovesByLevel ?? {},
      lastPlayedLevel: Number.isInteger(parsed.lastPlayedLevel) ? parsed.lastPlayedLevel! : null,
      updatedAt: parsed.updatedAt ?? new Date(0).toISOString(),
    };
  } catch {
    return { ...EMPTY_CAMPAIGN_PROGRESS, bestMovesByLevel: {} };
  }
}

export function getHighestCompletedCampaignLevel(): number {
  const progress = getCampaignProgress();
  return progress.completedLevels.length > 0 ? Math.max(...progress.completedLevels) : 0;
}

export function getUnlockedCampaignLevelLimit(totalLevels: number): number {
  const highestCompleted = getHighestCompletedCampaignLevel();
  // Keep a small window open ahead of the player so future levels feel close,
  // but late levels remain locked until the player approaches them.
  return Math.min(totalLevels, Math.max(3, highestCompleted + 3));
}

export function isCampaignLevelUnlocked(level: number, totalLevels: number): boolean {
  return level <= getUnlockedCampaignLevelLimit(totalLevels);
}

export function completeCampaignLevel(level: number, movesMade: number): CampaignProgress {
  const progress = getCampaignProgress();
  const completed = new Set(progress.completedLevels);
  completed.add(level);

  const currentBest = progress.bestMovesByLevel[String(level)];
  const nextBestMovesByLevel = {
    ...progress.bestMovesByLevel,
    [String(level)]: currentBest === undefined ? movesMade : Math.min(currentBest, movesMade),
  };

  const next: CampaignProgress = {
    completedLevels: Array.from(completed).sort((a, b) => a - b),
    bestMovesByLevel: nextBestMovesByLevel,
    lastPlayedLevel: level,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(CAMPAIGN_PROGRESS_KEY, JSON.stringify(next));
  return next;
}

export function resetCampaignProgress(): void {
  localStorage.removeItem(CAMPAIGN_PROGRESS_KEY);
}
