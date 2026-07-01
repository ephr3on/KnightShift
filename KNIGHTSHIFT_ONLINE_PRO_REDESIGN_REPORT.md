# KnightShift Online + Button Structure Redesign

## What changed

### 1. Standard action structure
- Added a shared `ScreenHeader` component.
- Moved important navigation/actions to a consistent top bar.
- Online Menu now has a visible `Menu` back button at the top.
- Online Lobby now has a persistent top-right `Leave` button.
- Online Race now has a persistent top-right `Leave` button and a visible timer.
- Online Result now has a persistent top-right `Leave` button.
- Solo Game now has a visible top-left `Back` button instead of hiding navigation in secondary controls.

### 2. Professional online lobby model
- Added a ready-check system for both host and guest.
- Both players must press `Ready` before the host can start.
- Changing match settings automatically clears ready state, so the guest must approve the new setup.
- Host start is protected in a Firestore transaction and validates:
  - room exists
  - room is still waiting
  - guest is present
  - both players are online
  - both players are ready

### 3. Presence and disconnect behavior
- Browser close / refresh in the lobby now marks the player as disconnected, not as an intentional leave.
- Intentional Leave still marks `leftRoom: true`.
- Heartbeat presence is kept.
- Race screen now offers a visible disconnected-opponent banner with a claim action.

### 4. Online race fairness
- Removed local Undo from online race because it could desync move count fairness.
- Removed local Restart from online race because it could desync the visible board and stored race stats.
- Race controls now focus on safe actions:
  - Clear Selection
  - Leave Race
- All valid moves still go through the shared core game logic before being submitted to Firestore.

### 5. Firestore model updates
- Added optional room metadata:
  - `version`
  - `createdByName`
- Added optional player state:
  - `ready`
- Added `setPlayerReady(roomCode, role, ready)` service function.
- Improved `hostStartMatch()` validation.
- Improved `updatePuzzleConfig()` to reset ready states safely without accidentally creating a fake guest object.

## Files changed
- `src/components/ScreenHeader.tsx` new shared action bar
- `src/components/OnlineMenu.tsx`
- `src/components/OnlineLobby.tsx`
- `src/components/OnlineRace.tsx`
- `src/components/OnlineResult.tsx`
- `src/components/GameScreen.tsx`
- `src/multiplayer/types.ts`
- `src/multiplayer/onlineRoomService.ts`
- `src/index.css`

## Verification
- `npm run build` passed.
- `npm run lint` passed with 0 errors.
- Existing 3 warnings remain from unrelated old files:
  - `UnlimitedMode.tsx`
  - `DailyPuzzle.tsx`
  - `SolverModal.tsx`

## Notes
- This is still a Firebase room-document model, but the room lifecycle is now more professional and safer.
- The next high-value online upgrade would be a server-authoritative move log or Cloud Function validation if you want stronger anti-cheat later.
