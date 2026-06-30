import type { Piece, GoalGroup } from '../types';
import type { SolverResult, SolverOptions, Move } from './types';
import {
  stateKey, pieceStateFromPieces, isGoalState,
  getSuccessors, type SolverState,
} from './state';

/**
 * Iterative Deepening DFS (IDDFS).
 *
 * Performs DFS up to depth limit L = 0, 1, 2, … until the goal is found.
 * Guarantees the shortest solution (like BFS) with memory O(depth) (like DFS).
 * Re-expands states at each depth limit increase — slower than BFS in practice
 * but useful when memory is constrained.
 */
export function solveIDDFS(
  initialPieces: Piece[],
  goalPieces: GoalGroup[],
  options: SolverOptions,
  knightMoveMap: Map<string, string[]>
): SolverResult {
  const t0 = performance.now();
  const { withTurns, maxStates = 500_000, maxTimeMs = 10_000 } = options;

  const initState = pieceStateFromPieces(initialPieces, withTurns);

  if (isGoalState(initState, goalPieces)) {
    return mkIDDFS(true, 0, [], 1, 0, t0, 'Already solved.', true);
  }

  let totalVisited = 0;
  let totalExpanded = 0;
  let timedOut = false;
  let foundPath: Move[] | null = null;
  const pathMoves: Move[] = [];
  const pathSet = new Set<string>([stateKey(initState)]);

  function dls(state: SolverState, depthLeft: number): boolean {
    if (timedOut || totalVisited > maxStates || performance.now() - t0 > maxTimeMs) {
      timedOut = true;
      return false;
    }
    if (depthLeft === 0) {
      if (isGoalState(state, goalPieces)) { foundPath = [...pathMoves]; return true; }
      return false;
    }
    totalExpanded++;
    for (const { state: next, move } of getSuccessors(state, knightMoveMap, withTurns)) {
      totalVisited++;
      const key = stateKey(next);
      if (!pathSet.has(key)) {
        pathSet.add(key);
        pathMoves.push(move);
        const found = dls(next, depthLeft - 1);
        pathMoves.pop();
        pathSet.delete(key);
        if (found) return true;
        if (timedOut) return false;
      }
    }
    return false;
  }

  for (let depth = 0; depth <= 70; depth++) {
    foundPath = null;
    pathMoves.length = 0;
    pathSet.clear();
    pathSet.add(stateKey(initState));

    const found = dls(initState, depth);
    if (found) {
      // TypeScript cannot track closure mutations, so we assert the path exists
      const idPath = foundPath as unknown as Move[];
      return mkIDDFS(true, idPath.length, idPath, totalVisited, totalExpanded, t0,
        `IDDFS found the optimal solution at depth ${depth}. ` +
        'Iterative Deepening DFS achieves the optimality of BFS with the memory efficiency of DFS. ' +
        'Each iteration re-expands all states up to the current depth limit, which costs time ' +
        'but only stores the current path in memory. ' +
        'For uniform-cost problems it behaves like BFS and finds the shortest solution.', true);
    }
    if (timedOut) break;
  }

  if (timedOut) {
    return mkIDDFS(false, null, [], totalVisited, totalExpanded, t0,
      'IDDFS timed out before completing the search.', false, true);
  }
  return mkIDDFS(false, null, [], totalVisited, totalExpanded, t0,
    'IDDFS exhaustively proved no solution exists within the depth limit.', true);
}

/**
 * Plain depth-limited DFS — NOT guaranteed optimal.
 * Finds the first solution at any depth ≤ maxDepth.
 * Included for educational comparison: shows that DFS may find longer paths.
 */
export function solveDFS(
  initialPieces: Piece[],
  goalPieces: GoalGroup[],
  options: SolverOptions,
  knightMoveMap: Map<string, string[]>,
  maxDepth = 70
): SolverResult {
  const t0 = performance.now();
  const { withTurns, maxStates = 500_000, maxTimeMs = 10_000 } = options;

  const initState = pieceStateFromPieces(initialPieces, withTurns);

  if (isGoalState(initState, goalPieces)) {
    return mkDFS(true, 0, [], 1, 0, t0, 'Already solved.', false);
  }

  let visited = 0;
  let expanded = 0;
  let timedOut = false;
  let foundPath: Move[] | null = null;
  const pathMoves: Move[] = [];
  const pathSet = new Set<string>([stateKey(initState)]);

  function dfs(state: SolverState, depth: number): boolean {
    if (timedOut || visited > maxStates || performance.now() - t0 > maxTimeMs) {
      timedOut = true;
      return false;
    }
    if (isGoalState(state, goalPieces)) { foundPath = [...pathMoves]; return true; }
    if (depth >= maxDepth) return false;
    expanded++;
    for (const { state: next, move } of getSuccessors(state, knightMoveMap, withTurns)) {
      visited++;
      const key = stateKey(next);
      if (!pathSet.has(key)) {
        pathSet.add(key);
        pathMoves.push(move);
        if (dfs(next, depth + 1)) return true;
        pathMoves.pop();
        pathSet.delete(key);
        if (timedOut) return false;
      }
    }
    return false;
  }

  dfs(initState, 0);

  if (foundPath !== null) {
    const dfsPath = foundPath as unknown as Move[];
    return mkDFS(true, dfsPath.length, dfsPath, visited, expanded, t0,
      `DFS found a solution in ${dfsPath.length} moves (NOT guaranteed optimal). ` +
      'DFS explores one branch as deep as possible before backtracking. ' +
      'It may find a solution faster than BFS, but the solution is not necessarily the shortest. ' +
      'For shortest paths, use BFS, UCS, A*, or IDDFS.', false);
  }
  if (timedOut) {
    return mkDFS(false, null, [], visited, expanded, t0,
      'DFS timed out before finding a solution.', false, true);
  }
  return mkDFS(false, null, [], visited, expanded, t0,
    'DFS found no solution within the depth limit.', false);
}

function mkIDDFS(
  solvable: boolean, movesCount: number | null, path: Move[],
  visited: number, expanded: number, t0: number,
  explanation: string, optimal = false, timedOut = false
): SolverResult {
  return { algorithm: 'IDDFS', solvable, optimal, movesCount, path,
    visitedStates: visited, expandedStates: expanded,
    timeMs: performance.now() - t0, explanation, timedOut };
}

function mkDFS(
  solvable: boolean, movesCount: number | null, path: Move[],
  visited: number, expanded: number, t0: number,
  explanation: string, optimal = false, timedOut = false
): SolverResult {
  return { algorithm: 'DFS', solvable, optimal, movesCount, path,
    visitedStates: visited, expandedStates: expanded,
    timeMs: performance.now() - t0, explanation, timedOut };
}
