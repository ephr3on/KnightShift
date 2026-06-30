import { parseCell, toCell, getKnightMoves } from '../gameLogic';

export type BoardSize = 'small' | 'classic' | 'medium' | 'large';

export const BOARD_SIZE_CONFIG: Record<BoardSize, {
  gridWidth: number;
  gridHeight: number;
  minCells: number;
  maxCells: number;
  label: string;
}> = {
  small:   { gridWidth: 4, gridHeight: 4, minCells: 8,  maxCells: 11,  label: 'Small' },
  classic: { gridWidth: 5, gridHeight: 5, minCells: 10, maxCells: 13,  label: 'Classic' },
  medium:  { gridWidth: 5, gridHeight: 5, minCells: 12, maxCells: 16,  label: 'Medium' },
  large:   { gridWidth: 6, gridHeight: 5, minCells: 14, maxCells: 20,  label: 'Large' },
};

export type BoardGenerationOptions = {
  boardSize: BoardSize;
};

function getOrthogonalNeighbors(cell: string, maxX: number, maxY: number): string[] {
  const { x, y } = parseCell(cell);
  const result: string[] = [];
  for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as const) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < maxX && ny >= 0 && ny < maxY) {
      result.push(toCell(nx, ny));
    }
  }
  return result;
}

function findKnightComponents(cells: string[]): string[][] {
  const moveMap = new Map<string, string[]>();
  for (const cell of cells) moveMap.set(cell, getKnightMoves(cell, cells));

  const visited = new Set<string>();
  const components: string[][] = [];

  for (const cell of cells) {
    if (visited.has(cell)) continue;
    const component: string[] = [];
    const queue = [cell];
    visited.add(cell);
    while (queue.length > 0) {
      const cur = queue.shift()!;
      component.push(cur);
      for (const nb of moveMap.get(cur) ?? []) {
        if (!visited.has(nb)) {
          visited.add(nb);
          queue.push(nb);
        }
      }
    }
    components.push(component);
  }
  return components;
}

export function generateIrregularBoard(
  options: BoardGenerationOptions,
  rng: () => number
): string[] | null {
  const { gridWidth, gridHeight, minCells, maxCells } = BOARD_SIZE_CONFIG[options.boardSize];

  const targetCells = Math.floor(rng() * (maxCells - minCells + 1)) + minCells;

  // Start from a random interior cell (avoids edge-only starts)
  const startX = Math.floor(rng() * gridWidth);
  const startY = Math.floor(rng() * gridHeight);
  const startCell = toCell(startX, startY);

  const board = new Set<string>([startCell]);
  const frontier = new Set<string>(getOrthogonalNeighbors(startCell, gridWidth, gridHeight));

  while (board.size < targetCells && frontier.size > 0) {
    const frontierArr = Array.from(frontier);
    const chosen = frontierArr[Math.floor(rng() * frontierArr.length)];
    frontier.delete(chosen);
    board.add(chosen);
    for (const nb of getOrthogonalNeighbors(chosen, gridWidth, gridHeight)) {
      if (!board.has(nb)) frontier.add(nb);
    }
  }

  const allCells = Array.from(board);
  if (allCells.length < 4) return null;

  // Keep only the largest knight-connected component
  const components = findKnightComponents(allCells);
  if (components.length === 0) return null;

  const largest = components.reduce((a, b) => (b.length > a.length ? b : a));
  if (largest.length < 4) return null;

  // Reject if too many cells have zero knight moves (dead-end-heavy boards)
  const moveMap = new Map<string, string[]>();
  for (const c of largest) moveMap.set(c, getKnightMoves(c, largest));
  const isolatedCount = largest.filter(c => (moveMap.get(c)?.length ?? 0) === 0).length;
  if (isolatedCount > 0) return null; // no isolated cells allowed

  // At least 30% of cells must have >=2 knight moves (meaningful choices)
  const richCells = largest.filter(c => (moveMap.get(c)?.length ?? 0) >= 2).length;
  if (richCells / largest.length < 0.3) return null;

  return largest;
}
