# KnightShift Invite Link + QR Update

## Summary
Added a professional invite flow for Online Race rooms.

## Added

### Direct invite URL
- Host lobby now creates a direct invite URL using the current deployed origin/path:
  - `?room=ABCDE`
- Example shape:
  - `https://your-domain.com/?room=ABCDE`
- Opening that URL routes the visitor directly to the Online Race join flow.
- The room code is prefilled and locked for the guest.
- The guest only needs to enter their name and press Join.

### QR code
- Added a local QR code component for the invite URL.
- No external QR service is required.
- The QR appears in the room lobby and can be hidden/shown.
- The QR scans to the same direct invite URL.

### Copy actions
- Room lobby now has:
  - Copy Code
  - Copy Link
  - Clickable invite-link preview
- Copy feedback is shown separately for code and link.

### App URL handling
- App startup reads:
  - `?room=ABCDE`
  - `?join=ABCDE`
  - `?r=ABCDE`
  - hash fallback: `#room=ABCDE`
- After a successful join, the invite parameter is removed from the browser URL using `history.replaceState`.
- Existing online sessions still restore normally.
- If no session exists and an invite code is present, the app opens the Online Join screen immediately.

## Files changed
- `src/App.tsx`
- `src/components/OnlineMenu.tsx`
- `src/components/OnlineLobby.tsx`
- `src/components/QRCode.tsx`
- `src/utils/qrCode.ts`
- `src/index.css`

## Validation
- `npm run build` passes.
- `npm run lint` passes with the same 3 pre-existing warnings unrelated to this change.
