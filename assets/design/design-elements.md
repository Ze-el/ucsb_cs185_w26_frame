# FRAME Design Elements Reference

Last updated: 2026-03-11
Owner: FRAME team

This file is a non-runtime reference for brand and visual decisions. It is not required for site functionality.

## 1) Brand

- Product name: `FRAME`
- Preferred casing: `FRAME` (all caps in logo/headline contexts), `Frame` (sentence case in body copy)
- Product descriptor: `AI-assisted event photo sharing`

## 2) Taglines

Primary (approved):
- `Sharing Memories, Made Simple.`

Secondary (approved):
- `Shared memories. Zero friction.`
- `Seamless photo sharing across iOS and Android.`

Exploratory (draft):
- `From camera roll chaos to instant shared albums.`
- `Capture once. Share instantly. Relive together.`

## 3) Color System

Source of truth for live tokens: `css/app_colors.css`

Core brand palette:

| Token | Hex | Notes |
| --- | --- | --- |
| `--app-yale-blue` | `#033F63` | Primary deep brand blue |
| `--app-stormy-teal` | `#28666E` | Accent teal |
| `--app-muted-teal` | `#7C9885` | Support accent |
| `--app-dry-sage` | `#B5B682` | Soft neutral accent |
| `--app-soft-peach` | `#FEDC97` | Warm highlight |

Theme sets currently implemented:
- `ocean` (default)
- `teal`
- `sage`

## 4) Typography

Source of truth for live usage: `index.html`, `css/styles.css`, `css/subpages.css`

Type roles:
- Display/headline serif: `Instrument Serif`
- Body/UI sans: `DM Sans`
- System fallback stack:
  `SF Pro Text`, `SF Pro Display`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`

Brand wordmark treatment:
- Wordmark text shown as `FRAME`
- Serif styling (`Instrument Serif`) for mark text
- Tight tracking and large display scale in hero/navigation contexts

## 5) Logo Assets

Current logo files:
- `images/frame-logo/frame-logo-navy.png` (default on light backgrounds)
- `images/frame-logo/frame-logo-white.png` (use on dark or high-contrast backgrounds)

Usage notes:
- Maintain clear space around logo equal to at least logo icon height / 2.
- Do not stretch or distort aspect ratio.
- Prefer navy logo on current site themes.

## 6) Copy Tone

- Clear, direct, low-friction language
- Emphasize ease, trust, and speed of sharing
- Avoid jargon in hero-level messaging

## 7) Change Log

- 2026-03-11: Created initial consolidated design reference file.
