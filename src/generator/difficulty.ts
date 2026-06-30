import type { PuzzleMode } from '../types';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Genius';

export const ALL_DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Very Hard', 'Genius'];

// [min, max] inclusive
export const DIFFICULTY_RANGES: Record<PuzzleMode, Record<Difficulty, [number, number]>> = {
  'no-turns': {
    Easy: [6, 20],
    Medium: [21, 32],
    Hard: [33, 44],
    'Very Hard': [45, 58],
    Genius: [59, 300],
  },
  'with-turns': {
    Easy: [6, 12],
    Medium: [13, 18],
    Hard: [19, 25],
    'Very Hard': [26, 35],
    Genius: [36, 300],
  },
};

export function getDifficultyFromOptimalMoves(movesCount: number, mode: PuzzleMode): Difficulty {
  const ranges = DIFFICULTY_RANGES[mode];
  for (const diff of ALL_DIFFICULTIES) {
    const [min, max] = ranges[diff];
    if (movesCount >= min && movesCount <= max) return diff;
  }
  return 'Genius';
}

export function difficultyMatches(
  movesCount: number,
  targetDifficulty: Difficulty,
  mode: PuzzleMode
): boolean {
  const [min, max] = DIFFICULTY_RANGES[mode][targetDifficulty];
  return movesCount >= min && movesCount <= max;
}

export function getMinMovesForDifficulty(difficulty: Difficulty, mode: PuzzleMode): number {
  return DIFFICULTY_RANGES[mode][difficulty][0];
}
