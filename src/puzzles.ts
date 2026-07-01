import type { Puzzle } from './types';

/**
 * Standard 10-cell irregular board used by every puzzle.
 *
 * Visual layout (top → bottom):
 *       b4
 *     b3 c3
 *   b2 c2 d2
 * a1 b1 c1 d1
 *
 * Knight move graph on this board (single branching point at b3):
 *   a1 ↔ c2, b3     b1 ↔ d2, c3     c1 ↔ b3
 *   d1 ↔ b2, c3     b2 ↔ d1         c2 ↔ a1, b4
 *   d2 ↔ b3, b1     b3 ↔ d2, c1, a1 c3 ↔ d1, b1     b4 ↔ c2
 *
 * Note on with-turn puzzles:
 *   Due to the tree structure of this board (no cycles), virtually all swap
 *   configurations are UNSOLVABLE with alternating turns.  The with-turn
 *   puzzles below therefore use BFS-confirmed non-swap goal positions that
 *   ARE achievable in exactly the stated number of moves.
 *
 * Note on optimal move counts:
 *   The card values are BFS-verified on the standard board used by the game.
 *   No-turn swap puzzles can be much longer than they first look because the
 *   board is narrow and bipartite.
 */
const CELLS: string[] = [
  'a1', 'b1', 'c1', 'd1',
  'b2', 'c2', 'd2',
  'b3', 'c3',
  'b4',
];

export const PUZZLES_NO_TURN: Puzzle[] = [
  {
    id: 'no-turn-flag',
    name: 'The Flag',
    mode: 'no-turns',
    difficulty: 'Easy',
    // BFS-confirmed shortest solution on this board.
    optimalMoves: 32,
    verifiedOptimalMoves: 32,
    verificationStatus: 'confirmed',
    cells: CELLS,
    initialPieces: [
      { id: 'W1', color: 'white', cell: 'c2' },
      { id: 'W2', color: 'white', cell: 'c1' },
      { id: 'B1', color: 'black', cell: 'c3' },
      { id: 'B2', color: 'black', cell: 'd2' },
    ],
    goalPieces: [
      { color: 'white', cells: ['c3', 'd2'] },
      { color: 'black', cells: ['c2', 'c1'] },
    ],
  },
  {
    id: 'no-turn-star',
    name: 'The Star',
    mode: 'no-turns',
    difficulty: 'Medium',
    // BFS-confirmed shortest solution on this board.
    optimalMoves: 32,
    verifiedOptimalMoves: 32,
    verificationStatus: 'confirmed',
    cells: CELLS,
    initialPieces: [
      { id: 'W1', color: 'white', cell: 'c3' },
      { id: 'W2', color: 'white', cell: 'c1' },
      { id: 'B1', color: 'black', cell: 'b2' },
      { id: 'B2', color: 'black', cell: 'd2' },
    ],
    goalPieces: [
      { color: 'white', cells: ['b2', 'd2'] },
      { color: 'black', cells: ['c3', 'c1'] },
    ],
  },
  {
    id: 'no-turn-bridge',
    name: 'The Bridge',
    mode: 'no-turns',
    difficulty: 'Hard',
    // BFS-confirmed shortest solution on this board.
    optimalMoves: 36,
    verifiedOptimalMoves: 36,
    verificationStatus: 'confirmed',
    cells: CELLS,
    initialPieces: [
      { id: 'W1', color: 'white', cell: 'b2' },
      { id: 'W2', color: 'white', cell: 'c2' },
      { id: 'B1', color: 'black', cell: 'a1' },
      { id: 'B2', color: 'black', cell: 'd1' },
    ],
    goalPieces: [
      { color: 'white', cells: ['a1', 'd1'] },
      { color: 'black', cells: ['b2', 'c2'] },
    ],
  },
  {
    id: 'no-turn-tower',
    name: 'The Tower',
    mode: 'no-turns',
    difficulty: 'Very Hard',
    // BFS-confirmed shortest solution on this board.
    optimalMoves: 38,
    verifiedOptimalMoves: 38,
    verificationStatus: 'confirmed',
    cells: CELLS,
    initialPieces: [
      { id: 'W1', color: 'white', cell: 'b2' },
      { id: 'W2', color: 'white', cell: 'b1' },
      { id: 'B1', color: 'black', cell: 'b4' },
      { id: 'B2', color: 'black', cell: 'b3' },
    ],
    goalPieces: [
      { color: 'white', cells: ['b4', 'b3'] },
      { color: 'black', cells: ['b2', 'b1'] },
    ],
  },
  {
    id: 'no-turn-house',
    name: 'The House',
    mode: 'no-turns',
    difficulty: 'Genius',
    // BFS-confirmed shortest solution on this board.
    optimalMoves: 56,
    verifiedOptimalMoves: 56,
    verificationStatus: 'confirmed',
    cells: CELLS,
    initialPieces: [
      { id: 'W1', color: 'white', cell: 'b2' },
      { id: 'W2', color: 'white', cell: 'd1' },
      { id: 'B1', color: 'black', cell: 'c3' },
      { id: 'B2', color: 'black', cell: 'b1' },
    ],
    goalPieces: [
      { color: 'white', cells: ['c3', 'b1'] },
      { color: 'black', cells: ['b2', 'd1'] },
    ],
  },
];

export const PUZZLES_WITH_TURN: Puzzle[] = [
  {
    id: 'with-turn-pyramid',
    name: 'The Pyramid',
    mode: 'with-turns',
    difficulty: 'Easy',
    optimalMoves: 12,
    verifiedOptimalMoves: 12,
    verificationStatus: 'confirmed',
    cells: CELLS,
    initialPieces: [
      { id: 'W1', color: 'white', cell: 'a1' },
      { id: 'W2', color: 'white', cell: 'b1' },
      { id: 'B1', color: 'black', cell: 'b2' },
      { id: 'B2', color: 'black', cell: 'c1' },
    ],
    // BFS-confirmed non-swap goal (direct swap is impossible with turns on this board)
    goalPieces: [
      { color: 'white', cells: ['c1', 'c2'] },
      { color: 'black', cells: ['a1', 'd2'] },
    ],
  },
  {
    id: 'with-turn-line',
    name: 'The Line',
    mode: 'with-turns',
    difficulty: 'Medium',
    optimalMoves: 15,
    verifiedOptimalMoves: 15,
    verificationStatus: 'confirmed',
    cells: CELLS,
    initialPieces: [
      { id: 'W1', color: 'white', cell: 'a1' },
      { id: 'W2', color: 'white', cell: 'c1' },
      { id: 'B1', color: 'black', cell: 'b1' },
      { id: 'B2', color: 'black', cell: 'd1' },
    ],
    goalPieces: [
      { color: 'white', cells: ['b1', 'c2'] },
      { color: 'black', cells: ['c1', 'd1'] },
    ],
  },
  {
    id: 'with-turn-center',
    name: 'The Center',
    mode: 'with-turns',
    difficulty: 'Hard',
    optimalMoves: 19,
    verifiedOptimalMoves: 19,
    verificationStatus: 'confirmed',
    cells: CELLS,
    initialPieces: [
      { id: 'W1', color: 'white', cell: 'b3' },
      { id: 'W2', color: 'white', cell: 'c2' },
      { id: 'B1', color: 'black', cell: 'c3' },
      { id: 'B2', color: 'black', cell: 'b2' },
    ],
    goalPieces: [
      { color: 'white', cells: ['a1', 'c3'] },
      { color: 'black', cells: ['b2', 'b3'] },
    ],
  },
  {
    id: 'with-turn-gate-keepers',
    name: 'The Gate Keepers',
    mode: 'with-turns',
    difficulty: 'Very Hard',
    optimalMoves: 25,
    verifiedOptimalMoves: 25,
    verificationStatus: 'confirmed',
    cells: CELLS,
    initialPieces: [
      { id: 'W1', color: 'white', cell: 'c3' },
      { id: 'W2', color: 'white', cell: 'd1' },
      { id: 'B1', color: 'black', cell: 'b2' },
      { id: 'B2', color: 'black', cell: 'c2' },
    ],
    goalPieces: [
      { color: 'white', cells: ['b3', 'c2'] },
      { color: 'black', cells: ['d1', 'd2'] },
    ],
  },
  {
    id: 'with-turn-arrow-head',
    name: 'The Arrow Head',
    mode: 'with-turns',
    difficulty: 'Genius',
    optimalMoves: 30,
    verifiedOptimalMoves: 30,
    verificationStatus: 'confirmed',
    cells: CELLS,
    initialPieces: [
      { id: 'W1', color: 'white', cell: 'a1' },
      { id: 'W2', color: 'white', cell: 'c1' },
      { id: 'B1', color: 'black', cell: 'b4' },
      { id: 'B2', color: 'black', cell: 'b3' },
    ],
    // Black fully returns to white's original positions; white moves to b4 + c2
    goalPieces: [
      { color: 'white', cells: ['b4', 'c2'] },
      { color: 'black', cells: ['a1', 'c1'] },
    ],
  },
];

export function getPuzzleById(id: string): import('./types').Puzzle | undefined {
  return [...PUZZLES_NO_TURN, ...PUZZLES_WITH_TURN].find(p => p.id === id);
}

// Emit console warnings at startup for any no-turn puzzles whose stated optimal
// move count could not be confirmed by BFS on the standard 10-cell board.
if (typeof window !== 'undefined') {
  for (const p of [...PUZZLES_NO_TURN, ...PUZZLES_WITH_TURN]) {
    if (
      p.verifiedOptimalMoves !== undefined &&
      p.verifiedOptimalMoves !== null &&
      p.verifiedOptimalMoves !== p.optimalMoves
    ) {
      console.warn(
        `[PUZZLE MISMATCH] "${p.name}" (${p.id}): ` +
        `displayed optimalMoves=${p.optimalMoves}, ` +
        `BFS-verified actual=${p.verifiedOptimalMoves}. ` +
        'The screenshot value was designed for a different board shape.'
      );
    }
  }
}
