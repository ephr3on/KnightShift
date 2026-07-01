# KnightShift Mobile Hero Centering Fix

## Issue
On mobile screens, the content inside the `menu-hero panel` felt slightly shifted to the right instead of sitting exactly in the visual center of the hero card.

## Fix
Added a final mobile-only CSS override that:

- Centers all grid children inside `.menu-hero.panel` with `justify-items: center`.
- Centers `.menu-hero-copy` with a stable max width and `margin-inline: auto`.
- Centers `.menu-primary-actions` inside the hero.
- Centers `.menu-preview-shell` explicitly with `justify-self: center` and `margin-inline: auto`.
- Centers the board preview wrapper and the board grid itself.
- Moves the hero glow pseudo-element from a right-anchored position to a centered position on mobile so it no longer creates a visually right-heavy panel.
- Keeps the desktop hero layout unchanged.

## Files changed

- `src/index.css`
- `KNIGHTSHIFT_MOBILE_HERO_CENTERING_REPORT.md`
