import { getKnightMoves } from '../gameLogic';
import type { SolverState } from './state';

/** Build the knight-move adjacency map for a given set of valid cells. */
export function buildKnightMoveMap(validCells: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const cell of validCells) {
    map.set(cell, getKnightMoves(cell, validCells));
  }
  return map;
}

/**
 * Precompute BFS shortest-knight-distances between every pair of valid cells.
 * Used by A* and IDA* for the admissible heuristic.
 * Distances are on the EMPTY board (no piece blocking), so they are always
 * lower bounds on the actual distances in a populated board.
 */
export function precomputeCellDistances(validCells: string[]): Map<string, Map<string, number>> {
  const moveMap = buildKnightMoveMap(validCells);
  const result = new Map<string, Map<string, number>>();

  for (const start of validCells) {
    const dist = new Map<string, number>();
    dist.set(start, 0);
    const queue: string[] = [start];
    let head = 0;
    while (head < queue.length) {
      const cur = queue[head++];
      const d = dist.get(cur)!;
      for (const nb of moveMap.get(cur) ?? []) {
        if (!dist.has(nb)) {
          dist.set(nb, d + 1);
          queue.push(nb);
        }
      }
    }
    result.set(start, dist);
  }
  return result;
}

/**
 * Admissible heuristic for A* / IDA*.
 *
 * For each color we compute the minimum total knight-moves needed to assign
 * all pieces to goal cells (ignoring piece-piece interference — the "relaxed"
 * problem). With exactly 2 pieces per color we try both 2! = 2 assignments
 * and take the minimum.
 *
 * Why admissible:
 *   - Precomputed distances are on an empty board → always ≤ actual moves.
 *   - Min-assignment never over-counts (we pick the cheapest pairing).
 *   - Therefore h(s) ≤ true remaining cost for any state s.
 *
 * Why consistent (monotone):
 *   - Moving one piece from A to B changes h by at most 1 (one knight move
 *     can reduce distance-to-goal by at most 1), so h(s) ≤ 1 + h(succ(s)).
 *   - This guarantees A* with a closed set is optimal.
 */
export function computeHeuristic(
  s: SolverState,
  whiteGoals: string[],
  blackGoals: string[],
  distances: Map<string, Map<string, number>>
): number {
  const d = (from: string, to: string): number =>
    distances.get(from)?.get(to) ?? Infinity;

  function minAssignment(pieces: string[], goals: string[]): number {
    if (pieces.length === 0 || goals.length === 0) return 0;
    if (pieces.length === 1) return d(pieces[0], goals[0] ?? '');
    // 2-piece case: try both assignments
    const cost0 = d(pieces[0], goals[0]) + d(pieces[1], goals[1] ?? '');
    const cost1 = d(pieces[0], goals[1] ?? '') + d(pieces[1], goals[0]);
    return Math.min(cost0, cost1);
  }

  const wh = minAssignment(s.white, whiteGoals);
  const bh = minAssignment(s.black, blackGoals);
  // If a piece can't reach a goal (disconnected board), treat as 0 to keep admissible
  return (isFinite(wh) ? wh : 0) + (isFinite(bh) ? bh : 0);
}
