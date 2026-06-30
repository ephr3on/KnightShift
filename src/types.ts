export type Color = 'white' | 'black';

export interface Piece {
  id: string;
  color: Color;
  cell: string;
}

export interface GoalGroup {
  color: Color;
  cells: string[];
}

export interface Puzzle {
  id: string;
  name: string;
  mode: 'no-turns' | 'with-turns';
  difficulty: string;
  optimalMoves: number;
  cells: string[];
  initialPieces: Piece[];
  goalPieces: GoalGroup[];
  locked?: boolean;
  /** BFS-verified actual optimal moves (may differ from optimalMoves if screenshots were ambiguous). */
  verifiedOptimalMoves?: number | null;
  verificationStatus?: 'confirmed' | 'mismatch' | 'needs-check';
}

export interface MoveRecord {
  pieceId: string;
  color: Color;
  from: string;
  to: string;
}

export type Screen =
  | 'menu'
  | 'puzzle-select'
  | 'game'
  | 'credits'
  | 'unlimited'
  | 'daily'
  | 'saved-puzzles'
  | 'online-menu'
  | 'online-lobby'
  | 'online-race'
  | 'online-result';
export type PuzzleMode = 'no-turns' | 'with-turns';

export interface SavedPuzzleEntry {
  id: string;
  puzzleId: string;
  name: string;
  seed: string;
  mode: PuzzleMode;
  difficulty: string;
  optimalMoves: number;
  dateGenerated: string;
  dateSaved: string;
  puzzleCode: string;
  puzzle: Puzzle;
}

export interface DailyResult {
  date: string;
  mode: PuzzleMode;
  movesMade: number;
  optimalMoves: number;
  completed: boolean;
}
