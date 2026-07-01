# KnightShift — Online No-Winner Logic Update

## Goal
Add a professional outcome model for online races when no player actually wins the puzzle.

Previously, some online endings could incorrectly award a win when neither player solved the puzzle, especially when a time or move limit ended the round. The room could also keep running forever in casual unlimited matches unless someone solved or forfeited.

## What changed

### 1. No-winner result reason
Added a new result reason:

```ts
'no_winner'
```

This is used when:

- the time limit expires and neither player solved the puzzle;
- both players reach the move limit and neither solved the puzzle;
- both players agree to end the round without a winner.

The round is recorded as a draw in the room score and round history.

### 2. Fair time-limit logic
If the timer expires and nobody solved the puzzle, the result is now:

```txt
No winner — round drawn
```

The system no longer gives the win to the player with fewer moves when neither player solved the puzzle.

### 3. Fair move-limit logic
If both players hit the move limit and nobody solved, the result is now:

```txt
No winner — round drawn
```

If at least one player solved before the limit, the solver still wins normally.

### 4. Mutual no-winner agreement
Added a live draw/no-winner agreement system during online race:

- Player A can click **Offer Draw**.
- Player B sees a clear banner and can click **Accept Draw**.
- If both agree, the round ends immediately as `no_winner`.
- The first player can cancel their offer before the opponent accepts.

### 5. Firestore model update
Added:

```ts
noWinner?: {
  hostRequested: boolean;
  guestRequested: boolean;
}
```

This is reset every time a new game starts, rematches, returns to lobby, or prepares a new round.

### 6. UI update
Online Race now has:

- **Offer Draw** button in the race controls.
- **Accept Draw** banner when the opponent offers.
- **Cancel Draw Offer** when the local player already offered.
- No-winner result text in the result screen.
- Round history displays `no winner` as the reason.

## Files changed

- `src/multiplayer/types.ts`
- `src/multiplayer/onlineRoomService.ts`
- `src/components/OnlineRace.tsx`
- `src/components/OnlineResult.tsx`
- `src/index.css`

## Validation

```bash
npm run build
```

Passed.

```bash
npm run lint
```

Passed with 0 errors. The same 3 old warnings remain in unrelated files.

