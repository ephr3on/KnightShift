# KnightShift Campaign Redesign Report

## What changed

### 1. Main game path
The main entry point is no longer the old open-ended generator. The home screen now leads with **Start Journey**, which opens a curated level roadmap.

### 2. Level Journey
Added a new main mode: **Level Journey**.

- 120 fixed level templates
- Sorted by verified optimal-move difficulty
- Four progression zones:
  - Academy
  - Crossroads
  - Citadel
  - Labyrinth
- First 3 levels are available immediately
- Future levels unlock gradually as the player completes nearby levels
- Progress is saved locally on the device
- Each level stores best moves
- Completed levels show completion status
- Locked levels stay visibly locked until the player gets close enough

### 3. Custom Puzzle moved to secondary mode
The old `Unlimited Mode` generator is now presented as **Custom Puzzle**.

This is now the place for:
- choosing a difficulty
- choosing board size
- choosing turn mode
- choosing seed/custom seed
- generating a one-off puzzle

It is no longer the main game path.

### 4. Home screen information architecture
Home screen now has:

Primary:
- Start Journey
- Daily Challenge

Secondary:
- Online Race
- Custom Puzzle
- Training Archive

Utility:
- Saved
- Credits

### 5. Campaign progress logic
Added campaign progression helpers in `src/storage.ts`:

- `getCampaignProgress()`
- `getHighestCompletedCampaignLevel()`
- `getUnlockedCampaignLevelLimit()`
- `isCampaignLevelUnlocked()`
- `completeCampaignLevel()`
- `resetCampaignProgress()`

Unlock rule:
- Level 1–3 are initially unlocked
- Completing levels unlocks a small forward window
- Current unlock limit = highest completed level + 3

### 6. Win integration
When a campaign level is solved, `GameScreen` now marks that campaign level as complete and stores the best move count.

## New files

- `src/campaignPuzzles.ts`
- `src/components/CampaignMode.tsx`
- `KNIGHTSHIFT_CAMPAIGN_REDESIGN_REPORT.md`

## Modified files

- `src/App.tsx`
- `src/types.ts`
- `src/storage.ts`
- `src/components/MainMenu.tsx`
- `src/components/GameScreen.tsx`
- `src/components/UnlimitedMode.tsx`
- `src/components/SavedPuzzles.tsx`
- `src/index.css`

## Verification

- `npm run build` passes
- `npm run lint` has 0 errors
- Remaining lint warnings are pre-existing warnings in unrelated files:
  - `DailyPuzzle.tsx`
  - `UnlimitedMode.tsx`
  - `SolverModal.tsx`

## Notes

The 120 Journey levels are fixed puzzle templates, not random generation at play time. The custom generator remains available separately for user-created puzzles.
