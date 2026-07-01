import type { Piece, Color, GoalGroup, Puzzle, MoveRecord } from './types';

export type GameStatus = 'playing' | 'won';

export interface GameState {
  puzzleId: string;
  status: GameStatus;
  pieces: Piece[];
  selectedPieceId: string | null;
  currentTurn: Color;
  moveCount: number;
  moveHistory: MoveRecord[];
}

export interface MoveValidationResult {
  ok: boolean;
  reason?: string;
}

export interface ApplyMoveResult {
  ok: boolean;
  state: GameState;
  move?: MoveRecord;
  won?: boolean;
  reason?: string;
}

export interface UndoMoveResult {
  ok: boolean;
  state: GameState;
  undoneMove?: MoveRecord;
  reason?: string;
}

export interface SolveResult {
  solvable: boolean;
  movesCount: number;
  solution: Array<{ pieceId: string; from: string; to: string }>;
  visitedStates?: number;
  timedOut?: boolean;
}

export interface PuzzleValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  computedOptimalMoves: number | null;
  computedSolution: Array<{ pieceId: string; from: string; to: string }>;
}

function clonePieces(pieces: Piece[]): Piece[] {
  return pieces.map(piece => ({ ...piece }));
}

function normalizeCell(cell: string): string {
  return cell.trim().toLowerCase();
}

export function parseCell(cell: string): { x: number; y: number } {
  const normalized = normalizeCell(cell);
  const match = /^([a-z])(\d+)$/.exec(normalized);
  if (!match) return { x: Number.NaN, y: Number.NaN };
  const x = match[1].charCodeAt(0) - 97;
  const y = Number.parseInt(match[2], 10) - 1;
  return { x, y };
}

export function toCell(x: number, y: number): string {
  return String.fromCharCode(97 + x) + (y + 1);
}

export function isLegalKnightMove(from: string, to: string): boolean {
  const a = parseCell(from);
  const b = parseCell(to);
  if (!Number.isFinite(a.x) || !Number.isFinite(a.y) || !Number.isFinite(b.x) || !Number.isFinite(b.y)) {
    return false;
  }
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
}

export function isCellInsideBoard(cell: string, validCellsOrBoardSize: string[] | number): boolean {
  if (Array.isArray(validCellsOrBoardSize)) {
    return new Set(validCellsOrBoardSize.map(normalizeCell)).has(normalizeCell(cell));
  }
  const { x, y } = parseCell(cell);
  return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 &&
    x < validCellsOrBoardSize && y < validCellsOrBoardSize;
}

export function getKnightMoves(cell: string, validCells: string[]): string[] {
  const { x, y } = parseCell(cell);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return [];

  const deltas = [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2],
  ];
  const validSet = new Set(validCells.map(normalizeCell));
  return deltas
    .map(([dx, dy]) => toCell(x + dx, y + dy))
    .filter(target => validSet.has(normalizeCell(target)));
}

export function getOccupiedCells(pieces: Piece[]): Map<string, Piece> {
  const map = new Map<string, Piece>();
  for (const piece of pieces) map.set(normalizeCell(piece.cell), piece);
  return map;
}

export function isCellOccupied(stateOrPieces: GameState | Piece[], cell: string, exceptPieceId?: string): boolean {
  const pieces = Array.isArray(stateOrPieces) ? stateOrPieces : stateOrPieces.pieces;
  return pieces.some(piece => piece.id !== exceptPieceId && normalizeCell(piece.cell) === normalizeCell(cell));
}

export function getPossibleMoves(
  piece: Piece,
  pieces: Piece[],
  validCells: string[]
): string[] {
  const occupied = getOccupiedCells(pieces);
  return getKnightMoves(piece.cell, validCells).filter(cell => !occupied.has(normalizeCell(cell)));
}

export function createInitialGameState(puzzle: Puzzle): GameState {
  return {
    puzzleId: puzzle.id,
    status: checkWin(puzzle.initialPieces, puzzle.goalPieces) ? 'won' : 'playing',
    pieces: clonePieces(puzzle.initialPieces),
    selectedPieceId: null,
    currentTurn: 'white',
    moveCount: 0,
    moveHistory: [],
  };
}

export function resetGame(puzzle: Puzzle): GameState {
  return createInitialGameState(puzzle);
}

export function getLegalMoves(gameState: GameState, pieceId: string, puzzle: Puzzle): string[] {
  const piece = gameState.pieces.find(p => p.id === pieceId);
  if (!piece || gameState.status !== 'playing') return [];
  if (puzzle.mode === 'with-turns' && piece.color !== gameState.currentTurn) return [];
  return getPossibleMoves(piece, gameState.pieces, puzzle.cells);
}

export function isLegalMove(
  gameState: GameState,
  pieceId: string,
  targetCell: string,
  puzzle: Puzzle,
): MoveValidationResult {
  if (gameState.status !== 'playing') return { ok: false, reason: 'The game is already finished.' };

  const piece = gameState.pieces.find(p => p.id === pieceId);
  if (!piece) return { ok: false, reason: 'Selected piece does not exist.' };

  if (puzzle.mode === 'with-turns' && piece.color !== gameState.currentTurn) {
    return { ok: false, reason: `It is ${gameState.currentTurn}'s turn.` };
  }

  if (!isCellInsideBoard(targetCell, puzzle.cells)) {
    return { ok: false, reason: 'Target cell is outside the board.' };
  }

  if (!isLegalKnightMove(piece.cell, targetCell)) {
    return { ok: false, reason: 'Knights move in an L shape only.' };
  }

  if (isCellOccupied(gameState, targetCell, pieceId)) {
    return { ok: false, reason: 'Target cell is occupied.' };
  }

  return { ok: true };
}

function nextTurn(turn: Color): Color {
  return turn === 'white' ? 'black' : 'white';
}

export function applyMove(
  gameState: GameState,
  pieceId: string,
  targetCell: string,
  puzzle: Puzzle,
): ApplyMoveResult {
  const validation = isLegalMove(gameState, pieceId, targetCell, puzzle);
  if (!validation.ok) return { ok: false, state: gameState, reason: validation.reason };

  const piece = gameState.pieces.find(p => p.id === pieceId);
  if (!piece) return { ok: false, state: gameState, reason: 'Selected piece does not exist.' };

  const move: MoveRecord = {
    pieceId,
    color: piece.color,
    from: piece.cell,
    to: targetCell,
  };

  const pieces = gameState.pieces.map(p => p.id === pieceId ? { ...p, cell: targetCell } : { ...p });
  const won = isWinState({ ...gameState, pieces }, puzzle);
  const state: GameState = {
    ...gameState,
    status: won ? 'won' : 'playing',
    pieces,
    selectedPieceId: null,
    currentTurn: puzzle.mode === 'with-turns' ? nextTurn(gameState.currentTurn) : gameState.currentTurn,
    moveCount: gameState.moveCount + 1,
    moveHistory: [...gameState.moveHistory, move],
  };

  return { ok: true, state, move, won };
}

export function undoMove(gameState: GameState, puzzle: Puzzle): UndoMoveResult {
  const undoneMove = gameState.moveHistory.at(-1);
  if (!undoneMove) return { ok: false, state: gameState, reason: 'No move to undo.' };

  const pieces = gameState.pieces.map(piece => (
    piece.id === undoneMove.pieceId ? { ...piece, cell: undoneMove.from } : { ...piece }
  ));
  const moveHistory = gameState.moveHistory.slice(0, -1);
  const state: GameState = {
    ...gameState,
    status: 'playing',
    pieces,
    selectedPieceId: null,
    currentTurn: puzzle.mode === 'with-turns' ? nextTurn(gameState.currentTurn) : gameState.currentTurn,
    moveCount: Math.max(0, gameState.moveCount - 1),
    moveHistory,
  };

  return { ok: true, state, undoneMove };
}

export function selectPiece(gameState: GameState, pieceId: string | null): GameState {
  return { ...gameState, selectedPieceId: pieceId };
}

export function checkWin(pieces: Piece[], goalPieces: GoalGroup[]): boolean {
  for (const goal of goalPieces) {
    const goalSet = new Set(goal.cells.map(normalizeCell));
    const piecesOfColor = pieces.filter(piece => piece.color === goal.color);
    if (piecesOfColor.length !== goal.cells.length) return false;
    if (!piecesOfColor.every(piece => goalSet.has(normalizeCell(piece.cell)))) return false;
  }
  return true;
}

export function isWinState(gameState: Pick<GameState, 'pieces'>, puzzle: Puzzle): boolean {
  return checkWin(gameState.pieces, puzzle.goalPieces);
}

export function getMoveNotation(color: Color, from: string, to: string): string {
  const symbol = color === 'white' ? '♘' : '♞';
  return `${symbol} ${from} -> ${to}`;
}

export function serializeGameState(gameState: GameState): string {
  return JSON.stringify(gameState);
}

export function deserializeGameState(data: string | unknown): GameState | null {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    if (!parsed || typeof parsed !== 'object') return null;
    const state = parsed as Partial<GameState>;
    if (!state.puzzleId || !Array.isArray(state.pieces) || !Array.isArray(state.moveHistory)) return null;
    return {
      puzzleId: state.puzzleId,
      status: state.status === 'won' ? 'won' : 'playing',
      pieces: clonePieces(state.pieces),
      selectedPieceId: state.selectedPieceId ?? null,
      currentTurn: state.currentTurn === 'black' ? 'black' : 'white',
      moveCount: Number.isFinite(state.moveCount) ? Number(state.moveCount) : state.moveHistory.length,
      moveHistory: state.moveHistory.map(move => ({ ...move })),
    };
  } catch {
    return null;
  }
}

function stateKey(pieces: Piece[], turn: Color | null): string {
  const sorted = [...pieces].sort((a, b) => a.id.localeCompare(b.id));
  return sorted.map(piece => `${piece.id}:${normalizeCell(piece.cell)}`).join('|') + (turn ? `|T:${turn}` : '');
}

export function getStateKey(gameState: GameState, puzzle?: Puzzle): string {
  const turn = puzzle?.mode === 'with-turns' ? gameState.currentTurn : null;
  return stateKey(gameState.pieces, turn);
}

export function generateNextStates(gameState: GameState, puzzle: Puzzle): Array<{ state: GameState; move: MoveRecord }> {
  if (gameState.status !== 'playing') return [];

  const movablePieces = puzzle.mode === 'with-turns'
    ? gameState.pieces.filter(piece => piece.color === gameState.currentTurn)
    : gameState.pieces;

  const nextStates: Array<{ state: GameState; move: MoveRecord }> = [];
  for (const piece of movablePieces) {
    for (const target of getLegalMoves(gameState, piece.id, puzzle)) {
      const result = applyMove(gameState, piece.id, target, puzzle);
      if (result.ok && result.move) nextStates.push({ state: result.state, move: result.move });
    }
  }
  return nextStates;
}

export function solvePuzzle(
  puzzle: Puzzle,
  initialGameState: GameState = createInitialGameState(puzzle),
  options: { maxMoves?: number; maxStates?: number } = {},
): SolveResult {
  const maxMoves = options.maxMoves ?? 80;
  const maxStates = options.maxStates ?? 500_000;
  const initKey = getStateKey(initialGameState, puzzle);
  const baseMoveCount = initialGameState.moveCount;
  const queue: GameState[] = [initialGameState.status === 'won' ? { ...initialGameState, status: 'playing' } : initialGameState];
  const parent = new Map<string, { parentKey: string; move: MoveRecord } | null>();
  parent.set(initKey, null);
  let head = 0;

  if (isWinState(initialGameState, puzzle)) {
    return { solvable: true, movesCount: 0, solution: [], visitedStates: 1 };
  }

  while (head < queue.length) {
    if (parent.size > maxStates) {
      return { solvable: false, movesCount: -1, solution: [], visitedStates: parent.size, timedOut: true };
    }

    const state = queue[head++];
    if (state.moveCount - baseMoveCount >= maxMoves) continue;

    for (const { state: nextState, move } of generateNextStates(state, puzzle)) {
      const key = getStateKey(nextState, puzzle);
      if (parent.has(key)) continue;
      parent.set(key, { parentKey: getStateKey(state, puzzle), move });

      if (isWinState(nextState, puzzle)) {
        const solution: MoveRecord[] = [];
        let currentKey = key;
        for (;;) {
          const entry = parent.get(currentKey);
          if (!entry) break;
          solution.push(entry.move);
          currentKey = entry.parentKey;
        }
        solution.reverse();
        return {
          solvable: true,
          movesCount: solution.length,
          solution: solution.map(move => ({ pieceId: move.pieceId, from: move.from, to: move.to })),
          visitedStates: parent.size,
        };
      }

      queue.push(nextState);
    }
  }

  return { solvable: false, movesCount: -1, solution: [], visitedStates: parent.size };
}

/** Backward-compatible BFS API used by older code paths. */
export function solveBFS(
  initialPieces: Piece[],
  validCells: string[],
  goalPieces: GoalGroup[],
  withTurns: boolean,
  maxMoves = 80,
): SolveResult {
  const puzzle: Puzzle = {
    id: 'adhoc',
    name: 'Ad-hoc Puzzle',
    mode: withTurns ? 'with-turns' : 'no-turns',
    difficulty: 'Custom',
    optimalMoves: 0,
    cells: validCells,
    initialPieces,
    goalPieces,
  };
  return solvePuzzle(puzzle, createInitialGameState(puzzle), { maxMoves });
}

export function getHint(gameState: GameState, puzzle: Puzzle): {
  ok: boolean;
  message: string;
  pieceId?: string;
  from?: string;
  to?: string;
  remainingMoves?: number;
} {
  if (gameState.status === 'won' || isWinState(gameState, puzzle)) {
    return { ok: false, message: 'Already solved.' };
  }

  const solution = solvePuzzle(puzzle, gameState, { maxMoves: 80 });
  const firstMove = solution.solution[0];
  if (!solution.solvable || !firstMove) {
    return { ok: false, message: solution.timedOut ? 'Hint timed out.' : 'No solution found from this position.' };
  }

  return {
    ok: true,
    message: `Best next move: ${firstMove.from} → ${firstMove.to}`,
    pieceId: firstMove.pieceId,
    from: firstMove.from,
    to: firstMove.to,
    remainingMoves: solution.movesCount,
  };
}

function pushDuplicateError(values: string[], label: string, errors: string[]): void {
  const seen = new Set<string>();
  for (const value of values.map(normalizeCell)) {
    if (seen.has(value)) errors.push(`Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

export function validatePuzzle(puzzle: Puzzle): PuzzleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!puzzle.id) errors.push('Puzzle id is missing.');
  if (!puzzle.name) errors.push('Puzzle name is missing.');
  if (puzzle.mode !== 'no-turns' && puzzle.mode !== 'with-turns') errors.push('Puzzle mode is invalid.');
  if (!Array.isArray(puzzle.cells) || puzzle.cells.length === 0) errors.push('Puzzle board cells are missing.');
  if (!Array.isArray(puzzle.initialPieces) || puzzle.initialPieces.length === 0) errors.push('Puzzle initial pieces are missing.');
  if (!Array.isArray(puzzle.goalPieces) || puzzle.goalPieces.length === 0) errors.push('Puzzle goals are missing.');

  const cellSet = new Set((puzzle.cells ?? []).map(normalizeCell));
  pushDuplicateError(puzzle.cells ?? [], 'board cell', errors);
  pushDuplicateError((puzzle.initialPieces ?? []).map(piece => piece.id), 'piece id', errors);
  pushDuplicateError((puzzle.initialPieces ?? []).map(piece => piece.cell), 'start cell', errors);

  for (const piece of puzzle.initialPieces ?? []) {
    if (piece.color !== 'white' && piece.color !== 'black') errors.push(`Piece ${piece.id} has invalid color.`);
    if (!cellSet.has(normalizeCell(piece.cell))) errors.push(`Piece ${piece.id} starts outside the board at ${piece.cell}.`);
  }

  for (const goal of puzzle.goalPieces ?? []) {
    if (goal.color !== 'white' && goal.color !== 'black') errors.push('Goal group has invalid color.');
    pushDuplicateError(goal.cells, `${goal.color} goal cell`, errors);
    for (const cell of goal.cells) {
      if (!cellSet.has(normalizeCell(cell))) errors.push(`${goal.color} goal cell ${cell} is outside the board.`);
    }
    const piecesOfColor = (puzzle.initialPieces ?? []).filter(piece => piece.color === goal.color).length;
    if (piecesOfColor !== goal.cells.length) {
      errors.push(`${goal.color} has ${piecesOfColor} pieces but ${goal.cells.length} goal cells.`);
    }
  }

  const allGoalCells = (puzzle.goalPieces ?? []).flatMap(goal => goal.cells);
  pushDuplicateError(allGoalCells, 'target cell across colors', errors);

  let computedOptimalMoves: number | null = null;
  let computedSolution: Array<{ pieceId: string; from: string; to: string }> = [];

  if (errors.length === 0) {
    const solved = solvePuzzle(puzzle, createInitialGameState(puzzle), { maxMoves: 100, maxStates: 800_000 });
    if (!solved.solvable) {
      errors.push(solved.timedOut ? 'Puzzle solver exceeded the state limit.' : 'Puzzle is not solvable.');
    } else {
      computedOptimalMoves = solved.movesCount;
      computedSolution = solved.solution;
      if (puzzle.optimalMoves !== solved.movesCount) {
        warnings.push(`Displayed optimalMoves is ${puzzle.optimalMoves}, computed optimal is ${solved.movesCount}.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    computedOptimalMoves,
    computedSolution,
  };
}
