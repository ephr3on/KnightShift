import type { Piece, GoalGroup } from '../types';

export interface Move {
  pieceColor: 'white' | 'black';
  from: string;
  to: string;
}

export interface SolverResult {
  algorithm: string;
  solvable: boolean;
  /** true = provably optimal; false = may not be optimal (DFS) or timed out */
  optimal: boolean;
  movesCount: number | null;
  path: Move[];
  visitedStates: number;
  expandedStates: number;
  timeMs: number;
  explanation: string;
  notes?: string;
  timedOut?: boolean;
}

export interface SolverComparisonResult {
  bestResult: SolverResult | null;
  allResults: SolverResult[];
  solvable: boolean;
  optimal: boolean;
  bestMovesCount: number | null;
  bestAlgorithm: string | null;
  impossibilityExplanation?: string;
  reachableStates?: number;
}

export interface SolverOptions {
  withTurns: boolean;
  maxStates?: number;
  maxTimeMs?: number;
}

// Web Worker messages
export type WorkerRequest = {
  type: 'solve';
  cells: string[];
  initialPieces: Piece[];
  goalPieces: GoalGroup[];
  options: SolverOptions;
};

export type WorkerResponse =
  | { type: 'progress'; message: string; algorithm?: string }
  | { type: 'result'; result: SolverComparisonResult }
  | { type: 'error'; message: string };
