import type { Piece, Color, GoalGroup } from './types';

export function parseCell(cell: string): { x: number; y: number } {
  const x = cell.charCodeAt(0) - 97; // 'a' = 0
  const y = parseInt(cell[1]) - 1;    // '1' = 0
  return { x, y };
}

export function toCell(x: number, y: number): string {
  return String.fromCharCode(97 + x) + (y + 1);
}

export function getKnightMoves(cell: string, validCells: string[]): string[] {
  const { x, y } = parseCell(cell);
  const deltas = [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2],
  ];
  const validSet = new Set(validCells);
  return deltas
    .map(([dx, dy]) => toCell(x + dx, y + dy))
    .filter(c => validSet.has(c));
}

export function getOccupiedCells(pieces: Piece[]): Map<string, Piece> {
  const map = new Map<string, Piece>();
  for (const p of pieces) map.set(p.cell, p);
  return map;
}

export function getPossibleMoves(
  piece: Piece,
  pieces: Piece[],
  validCells: string[]
): string[] {
  const occupied = getOccupiedCells(pieces);
  return getKnightMoves(piece.cell, validCells).filter(c => !occupied.has(c));
}

export function checkWin(pieces: Piece[], goalPieces: GoalGroup[]): boolean {
  for (const goal of goalPieces) {
    const goalSet = new Set(goal.cells);
    const piecesOfColor = pieces.filter(p => p.color === goal.color);
    if (piecesOfColor.length !== goal.cells.length) return false;
    if (!piecesOfColor.every(p => goalSet.has(p.cell))) return false;
  }
  return true;
}

export function getMoveNotation(color: Color, from: string, to: string): string {
  const symbol = color === 'white' ? '♘' : '♞';
  return `${symbol} ${from} -> ${to}`;
}

// BFS solver
export interface SolveResult {
  solvable: boolean;
  movesCount: number;
  solution: Array<{ pieceId: string; to: string }>;
}

function stateKey(pieces: Piece[], turn: Color | null): string {
  const sorted = [...pieces].sort((a, b) => a.id.localeCompare(b.id));
  return sorted.map(p => `${p.id}:${p.cell}`).join('|') + (turn ? `|T:${turn}` : '');
}

export function solveBFS(
  initialPieces: Piece[],
  validCells: string[],
  goalPieces: GoalGroup[],
  withTurns: boolean,
  maxMoves = 60
): SolveResult {
  type State = {
    pieces: Piece[];
    turn: Color;
    moves: Array<{ pieceId: string; to: string }>;
  };

  const initTurn: Color = 'white';
  const queue: State[] = [{ pieces: initialPieces, turn: initTurn, moves: [] }];
  const visited = new Set<string>();
  visited.add(stateKey(initialPieces, withTurns ? initTurn : null));

  while (queue.length > 0) {
    const { pieces, turn, moves } = queue.shift()!;
    if (moves.length > maxMoves) continue;

    if (checkWin(pieces, goalPieces)) {
      return { solvable: true, movesCount: moves.length, solution: moves };
    }

    const movablePieces = withTurns
      ? pieces.filter(p => p.color === turn)
      : pieces;

    for (const piece of movablePieces) {
      const targets = getPossibleMoves(piece, pieces, validCells);
      for (const target of targets) {
        const newPieces = pieces.map(p =>
          p.id === piece.id ? { ...p, cell: target } : p
        );
        const nextTurn: Color = withTurns ? (turn === 'white' ? 'black' : 'white') : turn;
        const key = stateKey(newPieces, withTurns ? nextTurn : null);
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({
            pieces: newPieces,
            turn: nextTurn,
            moves: [...moves, { pieceId: piece.id, to: target }],
          });
        }
      }
    }
  }

  return { solvable: false, movesCount: -1, solution: [] };
}
