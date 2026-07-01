# Button System Redesign

This update replaces the noisy all-gradient button style with a calmer action hierarchy.

## What changed

- Default buttons are now quiet glass buttons instead of strong gradient blocks.
- Only the most important action in each context uses the strong primary style.
- Dangerous actions like Leave/Delete are low-emphasis red outline buttons, not large red blocks.
- Compact utility actions use ghost buttons.
- Solo game controls now show only the two fastest actions directly:
  - Undo
  - Restart
- Less-used solo actions moved behind a small More button:
  - Analyze solution
  - Main menu
- Online result screen now keeps Rematch/New Puzzle as the main choices, while Lobby/Leave are smaller secondary actions.
- Main menu buttons are more compact on mobile to reduce vertical clutter.

## Build

`npm run build` passed successfully.

`npm run lint` has no errors. Existing warnings remain in older files and were not introduced by this button redesign.
