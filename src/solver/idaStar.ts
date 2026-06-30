import type { Piece, GoalGroup } from '../types';
import type { SolverResult, SolverOptions, Move } from './types';
import {
  stateKey, pieceStateFromPieces, isGoalState,
  getSuccessors, type SolverState,
} from './state';
import { computeHeuristic } from './graph';

/**
 * IDA* — Iterative Deepening A*.
 *
 * Combines DFS memory efficiency (O(depth)) with A* optimality.
 * At each iteration, DFS prunes any path whose f = g + h exceeds the current bound.
 * The bound increases to the minimum pruned f-value until the goal is found.
 *
 * Key property: because h is admissible, the bound equals the optimal cost
 * when the solution is first found.
 */
export function solveIDAStar(
  initialPieces: Piece[],
  goalPieces: GoalGroup[],
  options: SolverOptions,
  knightMoveMap: Map<string, string[]>,
  distances: Map<string, Map<string, number>>
): SolverResult {
  const t0 = performance.now();
  const { withTurns, maxStates = 500_000, maxTimeMs = 10_000 } = options;

  const whiteGoals = goalPieces.filter(g => g.color === 'white').flatMap(g => g.cells).sort();
  const blackGoals = goalPieces.filter(g => g.color === 'black').flatMap(g => g.cells).sort();
  const initState = pieceStateFromPieces(initialPieces, withTurns);

  if (isGoalState(initState, goalPieces)) {
    return mk(true, 0, [], 1, 0, t0, 'Already solved.');
  }

  // Mutable search context shared across recursive calls
  let visitedTotal = 0;
  let expandedTotal = 0;
  let timedOut = false;
  let foundPath: Move[] | null = null;
  const pathMoves: Move[] = [];
  const pathSet = new Set<string>([stateKey(initState)]);

  let bound = computeHeuristic(initState, whiteGoals, blackGoals, distances);
  let iterations = 0;

  function dfs(state: SolverState, g: number): number {
    if (timedOut || visitedTotal > maxStates || performance.now() - t0 > maxTimeMs) {
      timedOut = true;
      return Infinity;
    }
    const h = computeHeuristic(state, whiteGoals, blackGoals, distances);
    const f = g + h;
    if (f > bound) return f;
    if (isGoalState(state, goalPieces)) { foundPath = [...pathMoves]; return -1; }
    expandedTotal++;
    let minExceeded = Infinity;
    for (const { state: next, move } of getSuccessors(state, knightMoveMap, withTurns)) {
      visitedTotal++;
      const key = stateKey(next);
      if (!pathSet.has(key)) {
        pathSet.add(key);
        pathMoves.push(move);
        const sub = dfs(next, g + 1);
        pathMoves.pop();
        pathSet.delete(key);
        if (sub === -1) return -1;
        if (sub < minExceeded) minExceeded = sub;
        if (timedOut) return Infinity;
      }
    }
    return minExceeded;
  }

  while (!timedOut) {
    iterations++;
    const next = dfs(initState, 0);
    if (foundPath !== null) {
      const idaPath = foundPath as unknown as Move[];
      return mk(true, idaPath.length, idaPath, visitedTotal, expandedTotal, t0,
        `IDA* found the optimal solution in ${iterations} DFS iteration(s). ` +
        'Memory usage is O(solution depth) — only the current search path is stored. ' +
        'The admissible heuristic prunes branches that cannot improve on the current cost bound.');
    }
    if (next === Infinity || timedOut) break;
    bound = next;
  }

  if (timedOut) {
    return mk(false, null, [], visitedTotal, expandedTotal, t0,
      'IDA* timed out before completing the search.', true);
  }
  return mk(false, null, [], visitedTotal, expandedTotal, t0,
    'IDA* exhaustively proved no solution exists: all DFS branches were explored without reaching the goal.');
}

function mk(
  solvable: boolean, movesCount: number | null, path: Move[],
  visited: number, expanded: number, t0: number,
  explanation: string, timedOut = false
): SolverResult {
  return { algorithm: 'IDA*', solvable, optimal: !timedOut, movesCount, path,
    visitedStates: visited, expandedStates: expanded,
    timeMs: performance.now() - t0, explanation, timedOut };
}
