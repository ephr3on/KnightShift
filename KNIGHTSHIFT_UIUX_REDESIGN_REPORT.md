# KnightShift UI/UX Redesign Report

## Scope
This pass focuses on naming, visual identity, mobile-first information architecture, and the physical board presentation.

## Completed

### 1. Naming
- Replaced the old public game name with **KnightShift**.
- Updated the browser title.
- Updated the package name to `knightshift`.
- Updated the Credits screen copy.
- Confirmed there are no remaining visible `Four Knights` / `four-knights` references in the project source.

### 2. Main Menu UX
- Rebuilt the home screen around a direct product flow:
  - Primary action: **Play Endless**
  - Secondary action: **Daily Challenge**
  - Supporting modes: **Online Race**, **Classic Flow**, **Turn Rules**
  - Utilities: **Saved**, **Credits**
- Removed the old stacked section feeling from the main menu.
- Added a more premium hero area with a strong brand lockup, short value proposition, and live board preview.

### 3. Board Shape / Frame
- Removed the fixed rectangular board container styling.
- The board now visually follows the actual puzzle cell shape.
- Empty grid slots are invisible, so irregular boards no longer look trapped inside a square/rectangle.
- Added per-cell borders, rounded geometry, and organic drop shadows instead of one square outer frame.

### 4. Visual System
- Added a richer dark aurora background.
- Refined glass panels, button hierarchy, spacing, and card rhythm.
- Improved typography stack and scale using modern system/UI fonts.
- Made the generated/unlimited mode feel like the core product direction.

### 5. Validation
- `npm run build` passes successfully.
- `npm run lint` has 0 errors. Existing warnings remain in older files unrelated to this redesign.

## Notes
- No game logic was changed in this pass.
- The earlier logic refactor remains intact.
- The main remaining future UI improvement would be extracting inline styles from some older components into dedicated CSS classes for even cleaner maintainability.
