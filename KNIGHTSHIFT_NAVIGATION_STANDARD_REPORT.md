# KnightShift Navigation Standardization Report

## Goal
Unify all Back, Menu, Lobby, and Leave actions so every screen uses one predictable top-level navigation structure.

## New rule
All screen-level navigation belongs in `ScreenHeader` only:

- Left side: non-destructive navigation such as `Menu`, `Back`, or `Lobby`.
- Right side: destructive online exits such as `Leave`.
- Content area: gameplay and contextual actions only.
- Confirmation dialogs may still contain `Leave` / `Stay` because they are modal confirmations, not page navigation.

## Updated screens
The following screens now use the same `ScreenHeader` structure:

- `CampaignMode`
- `DailyPuzzle`
- `PuzzleSelect`
- `SavedPuzzles`
- `UnlimitedMode` / Custom Puzzle
- `Credits`
- `GameScreen`
- `OnlineMenu`
- `OnlineLobby`
- `OnlineRace`
- `OnlineResult`

## Removed duplicate navigation
Removed page-level Back / Leave duplicates from:

- Bottom Back button in `CampaignMode`
- Bottom Back button in `DailyPuzzle`
- Bottom Back button in `PuzzleSelect`
- Bottom Back button in `SavedPuzzles`
- Inline Back button in `UnlimitedMode`
- Bottom Main Menu button in `Credits`
- Duplicate Back to Menu button in the closed-room state
- Duplicate Leave Race buttons inside `OnlineRace` panels
- Duplicate Lobby / Leave buttons inside `OnlineResult` action area

## CSS updates
- Mobile header columns now use stable left/center/right slots instead of `auto 1fr auto`.
- This prevents the title from visually shifting depending on whether a right-side button exists.
- Online Race has a dedicated `race-screen-header` layout so the timer and Leave button stay visible without creating extra Leave buttons inside the game body.
- Credits now keeps the header at the top instead of centering the whole page vertically.

## Verification
- `npm run build` passed.
- `npm run lint` passed with 0 errors.
- Existing warnings remain unrelated to this navigation cleanup.
