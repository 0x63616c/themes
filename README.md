# cursor-themes

Custom themes for Cursor & VS Code.

## Blackout

A true-black, shadow-free dark theme. Hand-picked syntax colors, a Vercel-blue accent, and subtle bracket-pair colors. Designed for [Geist Mono](https://vercel.com/font), but works with any font.

## Install

```bash
git clone https://github.com/0x63616c/cursor-themes
cd cursor-themes
./scripts/install.sh
```

Then reload the window and pick **Blackout** from the theme picker (`Cmd+K Cmd+T`). The installer links into Cursor and VS Code if it finds them.

## Font (optional)

The theme is tuned for Geist Mono with ligatures. Install [Geist Mono](https://vercel.com/font), then add to your settings (or copy from `settings.recommended.json`):

```json
"editor.fontFamily": "Geist Mono, ui-monospace, monospace",
"editor.fontLigatures": true
```

## Tweak the colors

Every color comes from one file: `palette/palette.json`. Edit it, rebuild, reload.

```bash
bun run build
```

## License

MIT
