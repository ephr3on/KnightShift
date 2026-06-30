import type { Puzzle, Piece, GoalGroup, PuzzleMode } from '../types';
import type { Difficulty } from './difficulty';
import type { PuzzleQuality } from './puzzleValidator';
import type { BoardSize } from './boardGenerator';
import { createSeededRng, generateSeedString, hashString } from './seed';
import { generateIrregularBoard } from './boardGenerator';
import { getDifficultyFromOptimalMoves, difficultyMatches } from './difficulty';
import { scorePuzzle, isPuzzleValid } from './puzzleValidator';
import { solveBFS } from '../solver/bfs';
import { buildKnightMoveMap } from '../solver/graph';

export type { BoardSize };

export type GeneratorOptions = {
  mode: PuzzleMode;
  difficulty: Difficulty;
  boardSize: BoardSize;
  seed?: string;
  maxAttempts?: number;
  maxTimeMs?: number;
};

export type GeneratorResult =
  | {
      type: 'success';
      puzzle: Puzzle;
      seed: string;
      /** Full attempt-specific seed: "${baseSeed}|${attempt}". Use this for deterministic reproduction. */
      attemptSeed: string;
      optimalMoves: number;
      quality: PuzzleQuality;
    }
  | {
      type: 'failure';
      reason: string;
    };

export function encodePuzzleCode(
  cells: string[],
  whiteCells: string[],
  blackCells: string[],
  mode: PuzzleMode,
  seed: string,
  optimalMoves: number
): string {
  const data = {
    c: cells,
    w: whiteCells,
    b: blackCells,
    m: mode === 'no-turns' ? 0 : 1,
    s: seed,
    o: optimalMoves,
  };
  return btoa(JSON.stringify(data));
}

export function decodePuzzleCode(code: string): Puzzle | null {
  try {
    const data = JSON.parse(atob(code));
    const mode: PuzzleMode = data.m === 1 ? 'with-turns' : 'no-turns';
    const cells: string[] = data.c;
    const whiteCells: string[] = data.w;
    const blackCells: string[] = data.b;
    const seed: string = data.s;
    const optimalMoves: number = data.o;

    if (
      !Array.isArray(cells) || cells.length < 4 ||
      !Array.isArray(whiteCells) || whiteCells.length < 2 ||
      !Array.isArray(blackCells) || blackCells.length < 2
    ) return null;

    const initialPieces: Piece[] = [
      { id: 'W1', color: 'white', cell: whiteCells[0] },
      { id: 'W2', color: 'white', cell: whiteCells[1] },
      { id: 'B1', color: 'black', cell: blackCells[0] },
      { id: 'B2', color: 'black', cell: blackCells[1] },
    ];
    const goalPieces: GoalGroup[] = [
      { color: 'white', cells: [...blackCells] },
      { color: 'black', cells: [...whiteCells] },
    ];

    const num = 1000 + (hashString(seed) % 9000);
    return {
      id: `imported-${seed}`,
      name: `Imported Puzzle #${num}`,
      mode,
      difficulty: 'Medium',
      optimalMoves,
      verifiedOptimalMoves: optimalMoves,
      verificationStatus: 'confirmed',
      cells,
      initialPieces,
      goalPieces,
    };
  } catch {
    return null;
  }
}

const PROGRESS_MSGS = [
  'Searching for a good puzzle…',
  'Testing board shapes…',
  'Verifying optimal solution…',
  'Almost there…',
  'Checking connectivity…',
  'Running solver…',
  'Evaluating difficulty…',
  'Fine-tuning board…',
];

export function generatePuzzle(
  options: GeneratorOptions,
  onProgress?: (msg: string, attempt: number, max: number) => void
): GeneratorResult {
  const {
    mode,
    difficulty,
    boardSize,
    maxAttempts = 800,
    maxTimeMs = 14000,
  } = options;

  const seed = options.seed ?? generateSeedString();
  const start = Date.now();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (Date.now() - start > maxTimeMs) {
      return {
        type: 'failure',
        reason: 'Could not find a puzzle with these settings. Try easier difficulty or smaller board.',
      };
    }

    onProgress?.(PROGRESS_MSGS[(attempt - 1) % PROGRESS_MSGS.length], attempt, maxAttempts);

    // Each attempt uses a unique derived seed for full determinism
    const attemptSeed = `${seed}|${attempt}`;
    const rng = createSeededRng(attemptSeed);

    // 1. Generate board
    const cells = generateIrregularBoard({ boardSize }, rng);
    if (!cells || cells.length < 4) continue;

    // 2. Pick 4 distinct positions from the board
    const shuffled = [...cells];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    if (shuffled.length < 4) continue;

    const [w1, w2, b1, b2] = shuffled;

    const initialPieces: Piece[] = [
      { id: 'W1', color: 'white', cell: w1 },
      { id: 'W2', color: 'white', cell: w2 },
      { id: 'B1', color: 'black', cell: b1 },
      { id: 'B2', color: 'black', cell: b2 },
    ];

    // Swap goal: white goes to black's start, black goes to white's start
    const goalPieces: GoalGroup[] = [
      { color: 'white', cells: [b1, b2] },
      { color: 'black', cells: [w1, w2] },
    ];

    // 3. Solve with BFS
    const knightMoveMap = buildKnightMoveMap(cells);
    const result = solveBFS(
      initialPieces,
      goalPieces,
      { withTurns: mode === 'with-turns', maxStates: 200_000, maxTimeMs: 3000 },
      knightMoveMap
    );

    if (!result.solvable || result.timedOut || result.movesCount === null) continue;

    const movesCount = result.movesCount;
    if (!difficultyMatches(movesCount, difficulty, mode)) continue;

    // 4. Score quality
    const quality = scorePuzzle(cells, movesCount, mode, difficulty, result);
    if (!isPuzzleValid(quality, result, movesCount, difficulty, mode)) continue;

    // 5. Build puzzle object
    const actualDifficulty = getDifficultyFromOptimalMoves(movesCount, mode);
    const num = 1000 + (hashString(attemptSeed) % 9000);

    const puzzle: Puzzle = {
      id: `gen-${seed}-${attempt}`,
      name: `Generated Puzzle #${num}`,
      mode,
      difficulty: actualDifficulty,
      optimalMoves: movesCount,
      verifiedOptimalMoves: movesCount,
      verificationStatus: 'confirmed',
      cells,
      initialPieces,
      goalPieces,
    };

    return { type: 'success', puzzle, seed, attemptSeed, optimalMoves: movesCount, quality };
  }

  return {
    type: 'failure',
    reason: `Could not find a puzzle after ${maxAttempts} attempts. Try easier difficulty or smaller board.`,
  };
}

/**
 * Reproduce a puzzle from an attempt seed (e.g. "KS-ABCD-2024|42") without
 * running the BFS solver. Fast (~1ms) — safe to call on the main thread.
 *
 * The optimalMoves and difficulty are supplied by the caller because they were
 * computed when the host first generated the puzzle and stored in Firestore.
 */
export function reproducePuzzle(
  attemptSeed: string,
  mode: PuzzleMode,
  boardSize: BoardSize,
  optimalMoves: number,
  difficulty: Difficulty,
): Puzzle | null {
  try {
    const rng = createSeededRng(attemptSeed);
    const cells = generateIrregularBoard({ boardSize }, rng);
    if (!cells || cells.length < 4) return null;

    const shuffled = [...cells];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    if (shuffled.length < 4) return null;

    const [w1, w2, b1, b2] = shuffled;

    const initialPieces: Piece[] = [
      { id: 'W1', color: 'white', cell: w1 },
      { id: 'W2', color: 'white', cell: w2 },
      { id: 'B1', color: 'black', cell: b1 },
      { id: 'B2', color: 'black', cell: b2 },
    ];

    const goalPieces: GoalGroup[] = [
      { color: 'white', cells: [b1, b2] },
      { color: 'black', cells: [w1, w2] },
    ];

    return {
      id: `online-${attemptSeed}`,
      name: 'Online Race',
      mode,
      difficulty,
      optimalMoves,
      cells,
      initialPieces,
      goalPieces,
    };
  } catch {
    return null;
  }
}
