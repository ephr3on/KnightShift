# Mobile Redesign Notes

This build fixes the mobile layout so every scene is usable on phone screens.

## Changed
- The game and online race screens no longer hide the side panels on mobile.
- The board now scales with CSS variables instead of fixed inline pixel sizes.
- Move history, possible moves, goal preview, undo/restart, solver, leave race, and online status panels are visible in a professional mobile stack.
- Menu, puzzle selection, daily puzzle, saved puzzles, online lobby/result, modals, and unlimited mode have phone-friendly spacing, sticky back controls, full-width buttons, and responsive cards.
- Added safe-area padding for modern phones.

## Verified
- `npm run build` passes.
- `npm run lint` has warnings only from existing non-layout code patterns.
