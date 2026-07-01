# KnightShift — Online Leave Policy Update

## Goal
Add professional handling for intentional room exits in every online phase, including the case where the host leaves.

## Main behavior added

### 1. Unified leave policy
Added `leaveOnlineRoom(roomCode, role)` in `src/multiplayer/onlineRoomService.ts`.

This function is now the single intentional-leave entry point for online mode.

Rules:

- **Waiting lobby**
  - Host leaves → room status becomes `closed`.
  - Guest leaves → guest slot is removed and the host can invite another player.

- **Generating / countdown**
  - Host leaves → room closes.
  - Guest leaves → match start is cancelled, generated puzzle state is cleared, and host returns to waiting lobby.

- **Playing**
  - Any player leaves → round finishes immediately.
  - Opponent is declared winner.
  - `resultReason` becomes `opponent_left`.
  - Works the same if the host leaves or the guest leaves.

- **Finished result screen**
  - Leaving only marks the player as left.
  - The already recorded result stays unchanged.

### 2. Host-left safety
If the host has already left, `returnToLobby()` now closes the room instead of creating a broken lobby where host-only actions cannot run.

### 3. Guest-left recovery
If a guest leaves after a finished round and the host returns to lobby, the guest slot is cleared. The host can invite a new player instead of being stuck with a disconnected guest.

### 4. Online UI integration
Updated:

- `OnlineLobby.tsx`
- `OnlineRace.tsx`
- `OnlineResult.tsx`

All intentional Leave buttons now call the unified leave policy.

### 5. Result-screen protection
If a player has left the room:

- Rematch is disabled.
- New Puzzle is disabled.
- Header back changes from `Lobby` to `Menu`.
- A warning explains that the room can no longer continue.

### 6. Presence accuracy
`isPlayerOnline()` now treats `leftRoom: true` as offline even if an old heartbeat write briefly says `connected: true`.

### 7. Join-room cleanup
Removed conflicting Firestore nested updates when assigning `players.guest`. The guest player object is now written once cleanly.

## Validation

- `npm run build` passed.
- `npm run lint` passed with 0 errors.
- Existing 3 lint warnings remain in unrelated files:
  - `UnlimitedMode.tsx`
  - `DailyPuzzle.tsx`
  - `SolverModal.tsx`
