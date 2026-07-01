import { PUZZLES_NO_TURN, PUZZLES_WITH_TURN } from './puzzles';
import {
  applyMove,
  createInitialGameState,
  getHint,
  getLegalMoves,
  isLegalKnightMove,
  resetGame,
  solvePuzzle,
  validatePuzzle,
} from './gameLogic';

export interface GameLogicSelfTestResult {
  ok: boolean;
  passed: string[];
  failed: string[];
}

function expect(condition: boolean, label: string, passed: string[], failed: string[]): void {
  if (condition) passed.push(label);
  else failed.push(label);
}

/**
 * Dev-only smoke tests for the core engine.
 * Run from the console after importing this function, or call it temporarily
 * during development. It is intentionally not auto-executed in production.
 */
export function runGameLogicSelfTest(): GameLogicSelfTestResult {
  const passed: string[] = [];
  const failed: string[] = [];
  const puzzle = PUZZLES_NO_TURN[0];
  const state = createInitialGameState(puzzle);
  const firstPiece = state.pieces[0];
  const legalMoves = getLegalMoves(state, firstPiece.id, puzzle);
  const firstMove = legalMoves[0];

  expect(isLegalKnightMove('a1', 'b3'), 'knight movement accepts L jumps', passed, failed);
  expect(!isLegalKnightMove('a1', 'a2'), 'knight movement rejects straight moves', passed, failed);
  expect(legalMoves.length > 0, 'legal moves are generated', passed, failed);

  if (firstMove) {
    const moved = applyMove(state, firstPiece.id, firstMove, puzzle);
    expect(moved.ok, 'legal move is applied', passed, failed);
    expect(moved.state.moveCount === 1, 'move count increments', passed, failed);
    expect(resetGame(puzzle).moveCount === 0, 'reset clears move count', passed, failed);
  }

  const solved = solvePuzzle(puzzle, state);
  expect(solved.solvable && solved.movesCount === puzzle.optimalMoves, 'solver finds default optimal solution', passed, failed);

  const hint = getHint(state, puzzle);
  expect(hint.ok && hint.to !== undefined, 'hint returns the first optimal move', passed, failed);

  for (const p of [...PUZZLES_NO_TURN, ...PUZZLES_WITH_TURN]) {
    const report = validatePuzzle(p);
    expect(report.valid, `${p.id} validates`, passed, failed);
    expect(report.computedOptimalMoves === p.optimalMoves, `${p.id} optimal move count matches`, passed, failed);
  }

  return { ok: failed.length === 0, passed, failed };
}
