import type { Piece, GoalGroup } from '../types';
import type { Move } from './types';

export interface SolverState {
  white: string[]; // sorted cell positions of white knights
  black: string[]; // sorted cell positions of black knights
  turn: 'white' | 'black' | null; // null = no-turns mode
}

/** Canonical key: sorted white|sorted black[|turn] — piece IDs are irrelevant */
export function stateKey(s: SolverState): string {
  const w = [...s.white].sort().join(',');
  const b = [...s.black].sort().join(',');
  return s.turn ? `${w}|${b}|${s.turn}` : `${w}|${b}`;
}

export function pieceStateFromPieces(pieces: Piece[], withTurns: boolean): SolverState {
  const white = pieces.filter(p => p.color === 'white').map(p => p.cell).sort();
  const black = pieces.filter(p => p.color === 'black').map(p => p.cell).sort();
  return { white, black, turn: withTurns ? 'white' : null };
}

export function goalStateFromGoalPieces(goalPieces: GoalGroup[], turn: 'white' | 'black' | null): SolverState {
  const white = goalPieces.filter(g => g.color === 'white').flatMap(g => g.cells).sort();
  const black = goalPieces.filter(g => g.color === 'black').flatMap(g => g.cells).sort();
  return { white, black, turn };
}

export function isGoalState(s: SolverState, goalPieces: GoalGroup[]): boolean {
  const wGoal = new Set(goalPieces.filter(g => g.color === 'white').flatMap(g => g.cells));
  const bGoal = new Set(goalPieces.filter(g => g.color === 'black').flatMap(g => g.cells));
  if (s.white.length !== wGoal.size || s.black.length !== bGoal.size) return false;
  for (const c of s.white) if (!wGoal.has(c)) return false;
  for (const c of s.black) if (!bGoal.has(c)) return false;
  return true;
}

/**
 * Generate all valid successor (state, move) pairs.
 * No-turns: any knight may move.
 * With-turns: only the current turn's color moves; turn flips after.
 */
export function getSuccessors(
  s: SolverState,
  knightMoveMap: Map<string, string[]>,
  withTurns: boolean
): Array<{ state: SolverState; move: Move }> {
  const occupied = new Set([...s.white, ...s.black]);
  const results: Array<{ state: SolverState; move: Move }> = [];
  const colors: Array<'white' | 'black'> = withTurns
    ? [s.turn as 'white' | 'black']
    : ['white', 'black'];

  for (const color of colors) {
    const positions = color === 'white' ? s.white : s.black;
    for (const pos of positions) {
      for (const target of knightMoveMap.get(pos) ?? []) {
        if (!occupied.has(target)) {
          const newWhite = color === 'white'
            ? s.white.map(p => (p === pos ? target : p)).sort()
            : [...s.white];
          const newBlack = color === 'black'
            ? s.black.map(p => (p === pos ? target : p)).sort()
            : [...s.black];
          const nextTurn: 'white' | 'black' | null = withTurns
            ? (s.turn === 'white' ? 'black' : 'white')
            : null;
          results.push({
            state: { white: newWhite, black: newBlack, turn: nextTurn },
            move: { pieceColor: color, from: pos, to: target },
          });
        }
      }
    }
  }
  return results;
}

/**
 * Generate predecessor states for bidirectional BFS.
 * A predecessor P of state S satisfies: applying a forward move to P gives S.
 * Since knight moves are symmetric, predecessor generation mirrors successor generation
 * but uses the opposite turn (for with-turns mode).
 */
export function getPredecessors(
  s: SolverState,
  knightMoveMap: Map<string, string[]>,
  withTurns: boolean
): Array<{ state: SolverState; move: Move }> {
  const occupied = new Set([...s.white, ...s.black]);
  const results: Array<{ state: SolverState; move: Move }> = [];
  // The move that PRODUCED s came from the opposite turn
  const movingColor: 'white' | 'black' = withTurns
    ? (s.turn === 'white' ? 'black' : 'white')
    : 'white'; // handled below for no-turns

  const colorsToProcess: Array<'white' | 'black'> = withTurns
    ? [movingColor]
    : ['white', 'black'];

  for (const color of colorsToProcess) {
    const positions = color === 'white' ? s.white : s.black;
    for (const pos of positions) {
      // The piece was at `src` before the move and jumped to `pos`
      for (const src of knightMoveMap.get(pos) ?? []) {
        if (!occupied.has(src)) {
          // Predecessor has the piece at src (not pos)
          const predWhite = color === 'white'
            ? s.white.map(p => (p === pos ? src : p)).sort()
            : [...s.white];
          const predBlack = color === 'black'
            ? s.black.map(p => (p === pos ? src : p)).sort()
            : [...s.black];
          const predTurn: 'white' | 'black' | null = withTurns
            ? (s.turn === 'white' ? 'black' : 'white')
            : null;
          results.push({
            state: { white: predWhite, black: predBlack, turn: predTurn },
            move: { pieceColor: color, from: src, to: pos }, // the forward move that created s
          });
        }
      }
    }
  }
  return results;
}

/** Reconstruct path using a parent-pointer map (key → {parentKey, move} | null). */
export function reconstructPath(
  endKey: string,
  parentMap: Map<string, { parentKey: string; move: Move } | null>
): Move[] {
  const moves: Move[] = [];
  let cur = endKey;
  for (;;) {
    const entry = parentMap.get(cur);
    if (!entry) break;
    moves.push(entry.move);
    cur = entry.parentKey;
  }
  return moves.reverse();
}
