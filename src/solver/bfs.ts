import type { Piece, GoalGroup } from '../types';
import type { SolverResult, SolverOptions, Move } from './types';
import {
  stateKey, pieceStateFromPieces, isGoalState,
  getSuccessors, reconstructPath, type SolverState,
} from './state';

/**
 * Breadth-First Search — guaranteed shortest path.
 *
 * Explores all states at depth d before any state at depth d+1.
 * The first time we reach the goal state, the path is optimal.
 * Memory: O(V) where V = number of reachable states.
 */
export function solveBFS(
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
    return mkResult(true, 0, [], 1, 0, t0, 'The initial state is already the goal.');
  }

  const parent = new Map<string, { parentKey: string; move: Move } | null>();
  parent.set(initKey, null);

  const queue: SolverState[] = [initState];
  let head = 0;
  let expanded = 0;

  while (head < queue.length) {
    if (parent.size > maxStates || performance.now() - t0 > maxTimeMs) {
      return mkResult(false, null, [], parent.size, expanded, t0,
        'BFS exceeded the state/time limit — result is incomplete.', true);
    }

    const cur = queue[head++];
    expanded++;
    const curKey = stateKey(cur);

    for (const { state: next, move } of getSuccessors(cur, knightMoveMap, withTurns)) {
      const key = stateKey(next);
      if (!parent.has(key)) {
        parent.set(key, { parentKey: curKey, move });
        if (isGoalState(next, goalPieces)) {
          const path = reconstructPath(key, parent);
          return mkResult(true, path.length, path, parent.size, expanded, t0,
            'BFS guarantees the shortest solution by exploring states level-by-level. ' +
            'Every state at depth d is processed before any state at depth d+1, so the ' +
            'first time the goal is reached it must be via the shortest path.');
        }
        queue.push(next);
      }
    }
  }

  return mkResult(false, null, [], parent.size, expanded, t0,
    'BFS exhaustively explored all reachable states without finding the goal. ' +
    'The puzzle is unsolvable under the current mode.');
}

function mkResult(
  solvable: boolean, movesCount: number | null, path: Move[],
  visited: number, expanded: number, t0: number,
  explanation: string, timedOut = false
): SolverResult {
  return { algorithm: 'BFS', solvable, optimal: !timedOut, movesCount, path,
    visitedStates: visited, expandedStates: expanded,
    timeMs: performance.now() - t0, explanation, timedOut };
}
