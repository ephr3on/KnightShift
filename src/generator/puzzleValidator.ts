import type { PuzzleMode } from '../types';
import type { SolverResult } from '../solver/types';
import type { Difficulty } from './difficulty';
import { difficultyMatches } from './difficulty';
import { getKnightMoves } from '../gameLogic';

export interface PuzzleQuality {
  score: number;
  reasons: string[];
}

export function scorePuzzle(
  cells: string[],
  movesCount: number,
  mode: PuzzleMode,
  targetDifficulty: Difficulty,
  solverResult: SolverResult
): PuzzleQuality {
  const reasons: string[] = [];
  let score = 100;

  if (movesCount < 6) {
    score -= 60;
    reasons.push('Too short (< 6 moves)');
  }

  if (!difficultyMatches(movesCount, targetDifficulty, mode)) {
    score -= 50;
    reasons.push('Difficulty out of range');
  }

  if (solverResult.timedOut) {
    score -= 70;
    reasons.push('Solver timed out');
  }

  if (!solverResult.optimal) {
    score -= 40;
    reasons.push('Solution not optimal');
  }

  // Bonus for longer / more complex solutions
  if (movesCount >= 15) score += 5;
  if (movesCount >= 25) score += 5;
  if (movesCount >= 35) score += 5;

  // Bonus for board richness
  if (cells.length >= 12) score += 5;
  if (cells.length >= 15) score += 5;

  // Board connectivity bonus: many cells with multiple knight moves
  const moveMap = new Map<string, string[]>();
  for (const c of cells) moveMap.set(c, getKnightMoves(c, cells));
  const avgMoves = cells.reduce((s, c) => s + (moveMap.get(c)?.length ?? 0), 0) / cells.length;
  if (avgMoves >= 2.5) score += 5;
  if (avgMoves >= 3.5) score += 5;

  return { score, reasons };
}

export function isPuzzleValid(
  quality: PuzzleQuality,
  solverResult: SolverResult,
  movesCount: number,
  targetDifficulty: Difficulty,
  mode: PuzzleMode
): boolean {
  if (!solverResult.solvable) return false;
  if (solverResult.timedOut) return false;
  if (!solverResult.optimal) return false;
  if (movesCount < 6) return false;
  if (!difficultyMatches(movesCount, targetDifficulty, mode)) return false;
  return quality.score >= 55;
}
