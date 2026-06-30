import type { Piece, GoalGroup } from '../types';
import type { SolverComparisonResult, SolverOptions, SolverResult } from './types';
import { buildKnightMoveMap, precomputeCellDistances } from './graph';
import { solveBFS } from './bfs';
import { solveBidirectionalBFS } from './bidirectionalBfs';
import { solveAStar } from './astar';
import { solveIDAStar } from './idaStar';
import { solveUCS } from './ucs';
import { solveIDDFS } from './dfs';

export type ProgressCallback = (message: string, algorithm?: string) => void;

/**
 * Run all 6 algorithms and return a comparison result.
 *
 * Execution order: BFS first (to quickly establish solvability),
 * then A* (fastest heuristic-guided), then the rest.
 * If BFS proves impossibility, we still run the other algorithms
 * for educational completeness but expect them to agree.
 */
export async function solvePuzzleWithAllAlgorithms(
  cells: string[],
  initialPieces: Piece[],
  goalPieces: GoalGroup[],
  options: SolverOptions,
  onProgress?: ProgressCallback
): Promise<SolverComparisonResult> {
  const report = (msg: string, alg?: string) => onProgress?.(msg, alg);

  report('Building knight-move graph…');
  const knightMoveMap = buildKnightMoveMap(cells);

  report('Precomputing cell distances for heuristic…');
  const distances = precomputeCellDistances(cells);

  const results: SolverResult[] = [];

  // --- BFS ---
  report('Running BFS…', 'BFS');
  const bfsResult = solveBFS(initialPieces, goalPieces, options, knightMoveMap);
  results.push(bfsResult);

  // --- Bidirectional BFS ---
  report('Running Bidirectional BFS…', 'Bidirectional BFS');
  const biDirResult = solveBidirectionalBFS(initialPieces, goalPieces, options, knightMoveMap);
  results.push(biDirResult);

  // --- A* ---
  report('Running A*…', 'A*');
  const aStarResult = solveAStar(initialPieces, goalPieces, options, knightMoveMap, distances);
  results.push(aStarResult);

  // --- IDA* ---
  report('Running IDA*…', 'IDA*');
  const idaStarResult = solveIDAStar(initialPieces, goalPieces, options, knightMoveMap, distances);
  results.push(idaStarResult);

  // --- UCS ---
  report('Running UCS…', 'UCS');
  const ucsResult = solveUCS(initialPieces, goalPieces, options, knightMoveMap);
  results.push(ucsResult);

  // --- IDDFS ---
  report('Running IDDFS…', 'IDDFS');
  const iddfsResult = solveIDDFS(initialPieces, goalPieces, options, knightMoveMap);
  results.push(iddfsResult);

  report('Comparing results…');
  return buildComparisonResult(results, options);
}

function buildComparisonResult(
  results: SolverResult[],
  _options: SolverOptions
): SolverComparisonResult {
  const solvableResults = results.filter(r => r.solvable && !r.timedOut);
  const optimalResults = solvableResults.filter(r => r.optimal && r.movesCount !== null);

  const solvable = solvableResults.length > 0;

  // Best = optimal result with fewest moves, then fastest
  let bestResult: SolverResult | null = null;
  if (optimalResults.length > 0) {
    bestResult = optimalResults.reduce((a, b) => {
      if (a.movesCount === null) return b;
      if (b.movesCount === null) return a;
      if (a.movesCount !== b.movesCount) return a.movesCount < b.movesCount ? a : b;
      return a.timeMs <= b.timeMs ? a : b;
    });
  } else if (solvableResults.length > 0) {
    // Fall back to any solvable result
    bestResult = solvableResults.reduce((a, b) => {
      if (a.movesCount === null) return b;
      if (b.movesCount === null) return a;
      return a.movesCount <= b.movesCount ? a : b;
    });
  }

  // Use BFS visited count as the reachable-states proxy (BFS is exhaustive)
  const bfsResult = results.find(r => r.algorithm === 'BFS');
  const reachableStates = bfsResult ? bfsResult.visitedStates : undefined;

  let impossibilityExplanation: string | undefined;
  if (!solvable) {
    const bfsExpl = bfsResult?.explanation;
    impossibilityExplanation =
      `No solution exists. BFS exhaustively explored all ${(reachableStates ?? 0).toLocaleString()} ` +
      `reachable states and did not find the goal configuration. ` +
      (bfsExpl ? bfsExpl : '');
  }

  return {
    bestResult,
    allResults: results,
    solvable,
    optimal: bestResult?.optimal ?? false,
    bestMovesCount: bestResult?.movesCount ?? null,
    bestAlgorithm: bestResult?.algorithm ?? null,
    impossibilityExplanation,
    reachableStates,
  };
}
