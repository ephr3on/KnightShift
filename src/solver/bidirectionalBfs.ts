import type { Piece, GoalGroup } from '../types';
import type { SolverResult, SolverOptions, Move } from './types';
import {
  stateKey, pieceStateFromPieces, goalStateFromGoalPieces,
  isGoalState, getSuccessors, getPredecessors,
  reconstructPath, type SolverState,
} from './state';

/**
 * Bidirectional BFS — searches from both the initial state and goal state simultaneously.
 *
 * When the two frontiers meet, the total path is the forward path to the meeting
 * point + the backward path from the meeting point to the goal.
 *
 * Why faster than standard BFS:
 *   Standard BFS explores O(b^d) states; BiDir explores O(2 * b^(d/2)) states,
 *   which is exponentially smaller for large d and branching factor b.
 *
 * Path reconstruction:
 *   forwardParent[k] = {parentKey, move} traces back to the initial state.
 *   backwardParent[k] = {parentKey, move} records the forward move that PRODUCES
 *   the next state when following the backward frontier — so following
 *   backwardParent forward gives the path from the meeting point to the goal.
 */
export function solveBidirectionalBFS(
  initialPieces: Piece[],
  goalPieces: GoalGroup[],
  options: SolverOptions,
  knightMoveMap: Map<string, string[]>
): SolverResult {
  const t0 = performance.now();
  const { withTurns, maxStates = 500_000, maxTimeMs = 10_000 } = options;

  const initState = pieceStateFromPieces(initialPieces, withTurns);

  if (isGoalState(initState, goalPieces)) {
    return mkResult(true, 0, [], 1, 0, t0, 'Already solved.');
  }

  // For with-turns we cannot know the turn parity of the goal state, so we
  // seed the backward frontier with both turns.
  const goalTurns: Array<'white' | 'black' | null> = withTurns
    ? ['white', 'black']
    : [null];

  const forwardParent = new Map<string, { parentKey: string; move: Move } | null>();
  const backwardParent = new Map<string, { parentKey: string; move: Move } | null>();

  // State-object store for frontier expansion (we need the full state, not just the key)
  const stateStore = new Map<string, SolverState>();

  const initKey = stateKey(initState);
  forwardParent.set(initKey, null);
  stateStore.set(initKey, initState);

  for (const turn of goalTurns) {
    const gs = goalStateFromGoalPieces(goalPieces, turn);
    const gk = stateKey(gs);
    if (!backwardParent.has(gk)) {
      backwardParent.set(gk, null);
      stateStore.set(gk, gs);
    }
  }

  let forwardFrontier: SolverState[] = [initState];
  let backwardFrontier: SolverState[] = [];
  for (const turn of goalTurns) {
    backwardFrontier.push(goalStateFromGoalPieces(goalPieces, turn));
  }

  let expanded = 0;

  while (forwardFrontier.length > 0 || backwardFrontier.length > 0) {
    const totalVisited = forwardParent.size + backwardParent.size;
    if (totalVisited > maxStates || performance.now() - t0 > maxTimeMs) {
      return mkResult(false, null, [], totalVisited, expanded, t0,
        'Bidirectional BFS exceeded limits — result is incomplete.', true);
    }

    // Expand the smaller frontier each step
    if (
      forwardFrontier.length > 0 &&
      (backwardFrontier.length === 0 || forwardFrontier.length <= backwardFrontier.length)
    ) {
      const nextFrontier: SolverState[] = [];
      for (const cur of forwardFrontier) {
        expanded++;
        const curKey = stateKey(cur);
        for (const { state: next, move } of getSuccessors(cur, knightMoveMap, withTurns)) {
          const key = stateKey(next);
          if (!forwardParent.has(key)) {
            forwardParent.set(key, { parentKey: curKey, move });
            stateStore.set(key, next);
            nextFrontier.push(next);

            // Check if backward frontier already visited this state
            if (backwardParent.has(key)) {
              return buildSolution(key, forwardParent, backwardParent,
                forwardParent.size + backwardParent.size, expanded, t0);
            }
          }
        }
      }
      forwardFrontier = nextFrontier;
    } else {
      const nextFrontier: SolverState[] = [];
      for (const cur of backwardFrontier) {
        expanded++;
        const curKey = stateKey(cur);
        for (const { state: pred, move } of getPredecessors(cur, knightMoveMap, withTurns)) {
          const key = stateKey(pred);
          if (!backwardParent.has(key)) {
            // move is the forward move from pred → cur
            backwardParent.set(key, { parentKey: curKey, move });
            stateStore.set(key, pred);
            nextFrontier.push(pred);

            if (forwardParent.has(key)) {
              return buildSolution(key, forwardParent, backwardParent,
                forwardParent.size + backwardParent.size, expanded, t0);
            }
          }
        }
      }
      backwardFrontier = nextFrontier;
    }
  }

  return mkResult(false, null, [],
    forwardParent.size + backwardParent.size, expanded, t0,
    'Bidirectional BFS proved no solution exists by exhausting both frontiers.');
}

function buildSolution(
  meetKey: string,
  forwardParent: Map<string, { parentKey: string; move: Move } | null>,
  backwardParent: Map<string, { parentKey: string; move: Move } | null>,
  visited: number,
  expanded: number,
  t0: number
): SolverResult {
  // Forward: initial → meetKey
  const fwdPath = reconstructPath(meetKey, forwardParent);

  // Backward: meetKey → goal
  // backwardParent[meetKey] = {parentKey: X, move: meetKey→X}
  // Following the chain gives moves from meetKey to goal in order.
  const bwdPath: Move[] = [];
  let cur = meetKey;
  for (;;) {
    const entry = backwardParent.get(cur);
    if (!entry) break;
    bwdPath.push(entry.move);
    cur = entry.parentKey;
  }

  const fullPath = [...fwdPath, ...bwdPath];
  return mkResult(true, fullPath.length, fullPath, visited, expanded, t0,
    'Bidirectional BFS searched from both ends simultaneously, meeting in the middle. ' +
    'This reduces the explored state space from O(b^d) to roughly O(2·b^(d/2)), ' +
    'which is exponentially fewer states for large solutions.');
}

function mkResult(
  solvable: boolean, movesCount: number | null, path: Move[],
  visited: number, expanded: number, t0: number,
  explanation: string, timedOut = false
): SolverResult {
  return { algorithm: 'Bidirectional BFS', solvable, optimal: !timedOut, movesCount, path,
    visitedStates: visited, expandedStates: expanded,
    timeMs: performance.now() - t0, explanation, timedOut };
}
