# KnightShift Mobile-First Redesign

This version replaces the accumulated responsive patches with a clean, modern, mobile-first UI system while keeping the existing gameplay, puzzle generation, solver tools, saved puzzles, daily puzzles, and online race logic intact.

## Main changes

- Rebuilt the visual system around a modern dark glass UI with clear cards, soft gradients, and larger touch targets.
- Reworked every main screen style: main menu, puzzle selection, game board, unlimited generator, daily puzzle, saved puzzles, online menu, lobby, race screen, result screen, credits, and modals.
- Rebuilt the mobile play screen so it fits inside one phone viewport:
  - title/status at top
  - goal preview above the board
  - centered responsive board
  - compact move history on the left bottom
  - compact action buttons on the right bottom
- Removed the visible possible-moves side box; possible cells are still highlighted directly on the board.
- Online race uses the same mobile board layout and keeps player/opponent status compact.
- Board cells now calculate responsive size from the real board rows/columns, so classic and generated boards scale correctly.

## Validation

- `npm run build` passes.
- `npm run lint` returns existing warnings only; no errors.
