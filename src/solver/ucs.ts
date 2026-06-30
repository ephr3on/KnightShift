import type { Piece, GoalGroup } from '../types';
import type { SolverResult, SolverOptions, Move } from './types';
import {
  stateKey, pieceStateFromPieces, isGoalState,
  getSuccessors, reconstructPath, type SolverState,
} from './state';

/**
 * Uniform Cost Search (Dijkstra's algorithm with unit costs).
 *
 * UCS expands nodes in order of increasing path cost g(n).
 *
 * In this puzzle every move has cost 1, so g(n) equals the depth of n in
 * the BFS tree.  Therefore UCS and BFS visit states in exactly the same order,
 * and UCS degenerates to BFS.
 *
 * It is included here for educational comparison:
 *   - UCS handles weighted edges; BFS assumes uniform cost.
 *   - A* = UCS + heuristic: replacing h(n) = 0 in A* recovers UCS.
 *   - All three are optimal; UCS/BFS are special cases of A*.
 */
export function solveUCS(
  initialPieces: Piece[],
  goalPieces: GoalGroup[],
  options: SolverOptions,
  knightMoveMap: Map<string, string[]>
): SolverResult {
  const t0 = performance.now();
  const { withTurns, maxStates = 500_000, maxTimeMs = 10_000 } = options;

  const initState = pieceStateFromPieces(initialPieces, withTurns);
  const initKey = stateKey(initState);

  if (isGoalState(initState, goalPieces)) {
    return mk(true, 0, [], 1, 0, t0, 'Already solved.');
  }

  // Priority queue (min-heap by g-cost). Since g = depth and all costs are 1,
  // a simple FIFO queue in insertion order has the same expansion order.
  // We use a simple array sorted by cost for clarity; for unit costs this
  // reduces to FIFO / BFS order.
  const open: Array<{ key: string; g: number }> = [{ key: initKey, g: 0 }];
  const gCost = new Map<string, number>([[initKey, 0]]);
  const parent = new Map<string, { parentKey: string; move: Move } | null>([[initKey, null]]);
  const stateStore = new Map<string, SolverState>([[initKey, initState]]);
  let expanded = 0;

  while (open.length > 0) {
    if (gCost.size > maxStates || performance.now() - t0 > maxTimeMs) {
      return mk(false, null, [], gCost.size, expanded, t0,
        'UCS exceeded the state/time limit.', true);
    }

    // Pop minimum-cost node (for unit costs this is always the front)
    open.sort((a, b) => a.g - b.g);
    const { key: curKey, g } = open.shift()!;
    expanded++;
    const cur = stateStore.get(curKey)!;

    if (isGoalState(cur, goalPieces)) {
      const path = reconstructPath(curKey, parent);
      return mk(true, path.length, path, gCost.size, expanded, t0,
        'UCS (Uniform Cost Search) expands nodes in order of increasing path cost g(n). ' +
        'Since every move costs 1 in this puzzle, UCS is equivalent to BFS. ' +
        'UCS is the general form: BFS is UCS with unit costs; A* is UCS with a heuristic. ' +
        'All three guarantee optimal solutions.');
    }

    for (const { state: next, move } of getSuccessors(cur, knightMoveMap, withTurns)) {
      const key = stateKey(next);
      const newG = g + 1;
      if (!gCost.has(key) || newG < gCost.get(key)!) {
        gCost.set(key, newG);
        parent.set(key, { parentKey: curKey, move });
        stateStore.set(key, next);
        open.push({ key, g: newG });
      }
    }
  }

  return mk(false, null, [], gCost.size, expanded, t0,
    'UCS exhaustively explored all reachable states — no solution exists under the current mode.');
}

function mk(
  solvable: boolean, movesCount: number | null, path: Move[],
  visited: number, expanded: number, t0: number,
  explanation: string, timedOut = false
): SolverResult {
  return { algorithm: 'UCS', solvable, optimal: !timedOut, movesCount, path,
    visitedStates: visited, expandedStates: expanded,
    timeMs: performance.now() - t0, explanation, timedOut };
}
