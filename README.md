# themes

Custom themes for Cursor, VS Code, and OpenCode.

## Structure

```
cursor/         → Cursor & VS Code themes (package.json, install script, build pipeline)
opencode/       → OpenCode desktop and TUI theme files
```

## Cursor / VS Code — Blackout

A true-black, shadow-free dark theme for Cursor & VS Code. Hand-picked syntax colors, a Vercel-blue accent, and subtle bracket-pair colors. Designed for [Geist Mono](https://vercel.com/font), but works with any font.

### Install

```bash
cd cursor
./scripts/install.sh
```

Then reload the window and pick **Blackout** from the theme picker (`Cmd+K Cmd+T`). The installer links into Cursor and VS Code if it finds them.

### Font (optional)

The theme is tuned for Geist Mono with ligatures. Install [Geist Mono](https://vercel.com/font), then add to your settings (or copy from `settings.recommended.json`):

```json
"editor.fontFamily": "Geist Mono, ui-monospace, monospace",
"editor.fontLigatures": true
```

### Tweak the colors

Every color comes from one file: `palette/palette.json`. Edit it, rebuild, reload.

```bash
cd cursor
bun run build
```

## OpenCode — Blackout (TUI)

A true-black TUI theme for OpenCode. Symlinked to `~/.config/opencode/themes/`.

## OpenCode — Lucent Orgn+ (desktop)

Opaque-solid variant of the built-in `lucent-orng` desktop theme. Same orange accent palette with a clean `#0a0a0a` dark neutral (no warm tint).

| File | Purpose |
|---|---|
| `lucent-orng.json` | Reference copy of the built-in theme |
| `lucent-orng-plusplus.json` | Variant with transparency removed |

Set in `~/.config/opencode/tui.json`:
```json
"theme": "lucent-orng-plusplus"
```

## License

MIT
