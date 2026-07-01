# KnightShift Game Logic Refactor Report

## What changed

- Centralized the core game rules in `src/gameLogic.ts`.
- Added a formal `GameState` model with:
  - `puzzleId`
  - `status`
  - `pieces`
  - `selectedPieceId`
  - `currentTurn`
  - `moveCount`
  - `moveHistory`
- Added protected move validation through one official path:
  - `isLegalKnightMove`
  - `isCellInsideBoard`
  - `isCellOccupied`
  - `getLegalMoves`
  - `isLegalMove`
  - `applyMove`
- Added state helpers:
  - `createInitialGameState`
  - `resetGame`
  - `undoMove`
  - `selectPiece`
  - `serializeGameState`
  - `deserializeGameState`
- Added solver-facing helpers:
  - `getStateKey`
  - `generateNextStates`
  - `solvePuzzle`
  - backward-compatible `solveBFS`
- Added core hint support:
  - `getHint(gameState, puzzle)`
- Added puzzle validation:
  - `validatePuzzle(puzzle)`
- Added dev-only logic smoke tests:
  - `src/gameLogic.selftest.ts`

## UI integration

### Solo game

`src/components/GameScreen.tsx` now uses the centralized engine for:

- Initial game creation
- Piece selection
- Legal move generation
- Move application
- Move history
- Undo
- Restart
- Win detection
- Hints

The component no longer directly mutates piece positions or decides whether a move is legal.

### Online race

`src/components/OnlineRace.tsx` now routes player moves through the centralized engine before writing move counts to Firebase.
This keeps local and online movement validation consistent.

## Default puzzle validation

All built-in puzzles were validated by the new validation + BFS path.

| Puzzle ID | Old optimal | Computed optimal | Status |
|---|---:|---:|---|
| `no-turn-flag` | 32 | 32 | OK |
| `no-turn-star` | 32 | 32 | OK |
| `no-turn-bridge` | 36 | 36 | OK |
| `no-turn-tower` | 38 | 38 | OK |
| `no-turn-house` | 56 | 56 | OK |
| `with-turn-pyramid` | 12 | 12 | OK |
| `with-turn-line` | 15 | 15 | OK |
| `with-turn-center` | 19 | 19 | OK |
| `with-turn-gate-keepers` | 25 | 25 | OK |
| `with-turn-arrow-head` | 30 | 30 | OK |

No built-in puzzle needed correction in this pass.

## Verification performed

- `npm run build` passed.
- `npm run lint` passed with 0 errors. It still reports 3 pre-existing warnings in unrelated files:
  - `src/components/UnlimitedMode.tsx`
  - `src/components/DailyPuzzle.tsx`
  - `src/components/SolverModal.tsx`
- Dev self-test passed with all checks green:
  - Knight movement
  - Illegal move rejection
  - Legal move application
  - Move count update
  - Reset
  - Solver optimality
  - Hint generation
  - All default puzzles validate successfully

## Remaining notes

- The online mode still stores/reproduces puzzle identity by deterministic seed, not by saving the full puzzle object in Firestore. This is already efficient and keeps both players on the same puzzle as long as both use the same project version.
- A future hardening step could store a compact puzzle checksum or the full generated puzzle payload in Firestore for absolute version-proof online replay.
- The existing solver system in `src/solver/*` remains available for advanced analysis modals and generator workflows.
