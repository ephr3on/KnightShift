import type { Color, GoalGroup, Piece } from '../types';
import { buildKnightMoveMap } from './graph';
import {
  getSuccessors,
  isGoalState,
  reconstructPath,
  stateKey,
  type SolverState,
} from './state';
import type { Move } from './types';

export interface HintResult {
  ok: boolean;
  message: string;
  move?: Move;
  remainingMoves?: number;
  timedOut?: boolean;
}

interface HintOptions {
  maxStates?: number;
  maxTimeMs?: number;
}

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function stateFromPieces(
  pieces: Piece[],
  withTurns: boolean,
  currentTurn: Color,
): SolverState {
  const white = pieces.filter(p => p.color === 'white').map(p => p.cell).sort();
  const black = pieces.filter(p => p.color === 'black').map(p => p.cell).sort();
  return { white, black, turn: withTurns ? currentTurn : null };
}

/**
 * Returns the next move on a shortest path from the current board state.
 * Used by normal solo games only; online races intentionally do not call this.
 */
export function getOptimalHint(
  pieces: Piece[],
  cells: string[],
  goalPieces: GoalGroup[],
  withTurns: boolean,
  currentTurn: Color,
  options: HintOptions = {},
): HintResult {
  const maxStates = options.maxStates ?? 500_000;
  const maxTimeMs = options.maxTimeMs ?? 1_800;
  const t0 = nowMs();
  const knightMoveMap = buildKnightMoveMap(cells);
  const initState = stateFromPieces(pieces, withTurns, currentTurn);
  const initKey = stateKey(initState);

  if (isGoalState(initState, goalPieces)) {
    return { ok: false, message: 'Already solved.' };
  }

  const parent = new Map<string, { parentKey: string; move: Move } | null>();
  parent.set(initKey, null);

  const queue: SolverState[] = [initState];
  let head = 0;

  while (head < queue.length) {
    if (parent.size > maxStates || nowMs() - t0 > maxTimeMs) {
      return {
        ok: false,
        timedOut: true,
        message: 'Hint needs more time for this board. Try Analyze / Solve for the full solution.',
      };
    }

    const cur = queue[head++];
    const curKey = stateKey(cur);

    for (const { state: next, move } of getSuccessors(cur, knightMoveMap, withTurns)) {
      const key = stateKey(next);
      if (parent.has(key)) continue;

      parent.set(key, { parentKey: curKey, move });

      if (isGoalState(next, goalPieces)) {
        const path = reconstructPath(key, parent);
        const firstMove = path[0];
        if (!firstMove) {
          return { ok: false, message: 'Already solved.' };
        }
        return {
          ok: true,
          move: firstMove,
          remainingMoves: path.length,
          message: `Best next move: ${firstMove.pieceColor === 'white' ? '♘' : '♞'} ${firstMove.from} → ${firstMove.to}`,
        };
      }

      queue.push(next);
    }
  }

  return { ok: false, message: 'No solution found from this position.' };
}
