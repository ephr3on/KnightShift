# KnightShift Invite Icons + Hero Center Fix

## Changes

### Online invite UI
- Converted invite actions into compact icon-only buttons.
- The copy-code action is represented by `#`.
- The copy-link action is represented by `🔗`.
- The QR action is represented by `▦`.
- QR code is hidden by default and appears only after pressing the QR icon.
- Copying the invite link now shows a visible `Invite link copied` feedback line.
- Copying the room code shows a visible `Room code copied` feedback line.
- Kept accessible `aria-label` and `title` attributes so the icon-only buttons remain understandable.

### Mobile menu hero centering
- Reworked the mobile `.menu-hero.panel` layout to use a strict centered flex column.
- Centered all inner hero objects through layout rules, not only text alignment.
- Constrained all hero children with `max-width: 100%` and `min-width: 0` to prevent subtle right overflow.
- Centered the hero copy block, primary actions, preview shell, board wrapper, board grid, and meta badges.
- Allowed the preview meta badges to wrap instead of forcing a wide row that can visually push the block to the right.
- Added a smaller-width mobile override for very narrow screens.

## Verification
- `npm run build` passes.
- `npm run lint` passes with 0 errors.
- Existing 3 warnings remain unrelated to this change.
