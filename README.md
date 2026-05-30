# Blackout — Cursor theme

True-black, shadow-free Cursor theme. Punchy syntax, Vercel-blue accent.

## Install
1. `./scripts/install.sh` — symlinks this folder into `~/.cursor/extensions`.
2. In Cursor: `Developer: Reload Window`, then `Cmd+K Cmd+T` → **Blackout**.

## Fonts (separate from the theme)
A color theme can't set fonts. Run `./scripts/check-fonts.sh`; if Geist / Geist
Mono are missing, install from https://vercel.com/font. Then merge
`settings.recommended.json` into your Cursor `settings.json`.

## Tuning colors
Edit `palette/palette.json`, run `bun run build`, reload Cursor. Tests:
`bun test`.
