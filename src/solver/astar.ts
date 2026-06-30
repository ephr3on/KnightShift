import type { Piece, GoalGroup } from '../types';
import type { SolverResult, SolverOptions, Move } from './types';
import {
  stateKey, pieceStateFromPieces, isGoalState,
  getSuccessors, reconstructPath, type SolverState,
} from './state';
import { computeHeuristic } from './graph';

/** Simple binary min-heap for A* open list entries. */
class MinHeap {
  private data: Array<{ f: number; key: string }> = [];

  push(f: number, key: string): void {
    this.data.push({ f, key });
    this.bubbleUp(this.data.length - 1);
  }

  pop(): { f: number; key: string } | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  get size(): number { return this.data.length; }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p].f <= this.data[i].f) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }

  private sinkDown(i: number): void {
    const n = this.data.length;
    for (;;) {
      let min = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.data[l].f < this.data[min].f) min = l;
      if (r < n && this.data[r].f < this.data[min].f) min = r;
      if (min === i) break;
      [this.data[min], this.data[i]] = [this.data[i], this.data[min]];
      i = min;
    }
  }
}

/**
 * A* Search — optimal search guided by an admissible heuristic.
 *
 * f(n) = g(n) + h(n)  where:
 *   g(n) = moves made so far (cost from initial to n)
 *   h(n) = admissible heuristic estimate of remaining cost
 *
 * The heuristic uses precomputed BFS knight-distances on the empty board.
 * Because the heuristic is also consistent (monotone), A* with a closed set
 * is guaranteed to find the optimal solution without re-expanding states.
 *
 * In practice A* expands far fewer states than BFS when h is informative.
 */
export function solveAStar(
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
    return mkResult(true, 0, [], 1, 0, t0, 'Already solved.');
  }

  const initKey = stateKey(initState);
  const initH = computeHeuristic(initState, whiteGoals, blackGoals, distances);

  const open = new MinHeap();
  open.push(initH, initKey);

  // g-cost map: cheapest known cost to each state
  const gCost = new Map<string, number>([[initKey, 0]]);
  // parent map for path reconstruction
  const parent = new Map<string, { parentKey: string; move: Move } | null>();
  parent.set(initKey, null);
  // state store for expansion
  const stateStore = new Map<string, SolverState>();
  stateStore.set(initKey, initState);
  // closed set (expanded states — safe because heuristic is consistent)
  const closed = new Set<string>();

  let expanded = 0;

  while (open.size > 0) {
    if (gCost.size > maxStates || performance.now() - t0 > maxTimeMs) {
      return mkResult(false, null, [], gCost.size, expanded, t0,
        'A* exceeded the state/time limit — result is incomplete.', true);
    }

    const { key: curKey } = open.pop()!;
    if (closed.has(curKey)) continue;
    closed.add(curKey);
    expanded++;

    const cur = stateStore.get(curKey)!;

    if (isGoalState(cur, goalPieces)) {
      const path = reconstructPath(curKey, parent);
      return mkResult(true, path.length, path, gCost.size, expanded, t0,
        'A* found the optimal solution by expanding states in order of f = g + h. ' +
        'The heuristic (min-assignment knight distances on empty board) is admissible ' +
        'and consistent, so A* never re-expands a state and the first goal found is optimal. ' +
        'A* typically explores far fewer states than BFS when the heuristic is informative.');
    }

    const g = gCost.get(curKey)!;

    for (const { state: next, move } of getSuccessors(cur, knightMoveMap, withTurns)) {
      const key = stateKey(next);
      if (closed.has(key)) continue;
      const newG = g + 1;
      if (!gCost.has(key) || newG < gCost.get(key)!) {
        gCost.set(key, newG);
        parent.set(key, { parentKey: curKey, move });
        stateStore.set(key, next);
        const h = computeHeuristic(next, whiteGoals, blackGoals, distances);
        open.push(newG + h, key);
      }
    }
  }

  return mkResult(false, null, [], gCost.size, expanded, t0,
    'A* exhaustively proved no solution exists: the open list was empty before the goal was found.');
}

function mkResult(
  solvable: boolean, movesCount: number | null, path: Move[],
  visited: number, expanded: number, t0: number,
  explanation: string, timedOut = false
): SolverResult {
  return { algorithm: 'A*', solvable, optimal: !timedOut, movesCount, path,
    visitedStates: visited, expandedStates: expanded,
    timeMs: performance.now() - t0, explanation, timedOut };
}
