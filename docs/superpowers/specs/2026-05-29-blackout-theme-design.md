# Blackout — Cursor Theme (Design Spec)

**Date:** 2026-05-29
**Status:** Approved for planning
**Author:** Calum + Claude

## Overview

Blackout is a true-black, shadow-free dark color theme for Cursor (a VS Code
fork), built around the Geist aesthetic with a hand-picked "Punchy" syntax
palette and a Vercel-blue accent. It ships as a standard VS Code color-theme
extension installed locally via symlink, so color edits hot-reload on Cursor
restart while we tune.

This spec covers **Phase 1 only**: the theme itself + a proven install
pipeline. A standalone web-based theme builder is **Phase 2**, deferred to its
own spec.

## Goals

- A single dark theme: pure `#000000` surfaces, **no shadows anywhere**.
- Regions separated by 1px hairlines (`#1a1a1a`), never by shadow or elevation.
- "Punchy" syntax palette (saturated but controlled), comments italic.
- Vercel-blue (`#0a84ff`) as the one interactive accent; white/emerald/amber as
  neutral + semantic colors.
- Geist (UI) + Geist Mono (editor) fonts, ligatures on.
- Prove the install works end-to-end *before* filling the full palette.
- Clean, well-structured, schema-valid theme JSON with automated checks.

## Non-Goals (Phase 1)

- Light variant. (Dark only.)
- The Phase 2 web builder (color pickers, live preview, export).
- Custom icon theme / product icon theme.
- Distribution to the marketplace / OpenVSX. (Local install only for now.)

## Locked Decisions

| Decision | Choice |
|---|---|
| Tooling scope | Phased: theme first (this spec), builder later |
| Syntax saturation | Punchy (bright, controlled) |
| Surface depth | Pure `#000000` everywhere + hairline borders |
| Selection / current line | Subtle gray, full-line current-line highlight |
| Primary accent | Vercel Blue `#0a84ff` |
| Semantic colors | white `#ededed`, emerald `#34d399`, amber `#ffb454`, red `#fb5a4b` |
| Italics | Comments only |
| Bracket-pair colorization | Subtle, 3 muted hues, on nesting only |
| Ligatures | On |
| Variants | Dark only |
| Install | Local extension folder, symlinked into `~/.cursor/extensions` |
| Name | Blackout |

## Palette

### Surfaces & chrome

| Role | Hex |
|---|---|
| Background (editor, sidebar, panels, all) | `#000000` |
| Current-line highlight (full width) | `#0a0a0a` |
| Selection | `#232323` |
| Hairline border / separators | `#1a1a1a` |
| Slightly stronger border (focus, active) | `#2a2a2a` |
| Foreground (default text) | `#ededed` |
| Muted foreground (UI labels) | `#8a8a8a` |
| Faint foreground (placeholders) | `#5a5a5a` |
| Line numbers / active line number | `#3a3a3a` / `#8a8a8a` |

### Syntax (Punchy)

| Token role | Hex | Style |
|---|---|---|
| Keyword / storage / control | `#9a86ff` | — |
| String / char | `#46d889` | — |
| Function / method (decl + call) | `#ffb454` | — |
| Type / class / interface / enum | `#57cdef` | — |
| Number / constant / boolean / null | `#f47ea0` | — |
| Comment | `#6a6a6a` | italic |
| Punctuation / operators | `#9a9a9a` | — |
| Variable / parameter / property / default text | `#ededed` | — |
| Regex | `#46d889` | — |
| Decorator / annotation | `#ffb454` | — |
| Tag name (JSX/HTML) | `#57cdef` | — |
| Attribute name | `#ffb454` | — |
| Invalid / deprecated | `#fb5a4b` | — |

### Accent & semantic

| Role | Hex |
|---|---|
| Primary accent (active tab, focus ring, links, active-file marker, caret) | `#0a84ff` |
| Neutral / primary button bg (text `#000`) | `#ededed` |
| Success / git-added / "ok" | `#34d399` |
| Warning / git-modified / attention | `#ffb454` |
| Error / git-deleted / danger | `#fb5a4b` |

### Bracket-pair (nesting only, muted)

| Depth | Hex |
|---|---|
| 1 | `#6f9bff` (muted blue) |
| 2 | `#e0b06a` (muted amber) |
| 3 | `#5cc593` (muted emerald) |

(Cycles 1→2→3→1…)

### Terminal ANSI (16)

Derived from the palette so the integrated terminal matches:

| ANSI | Normal | Bright |
|---|---|---|
| black | `#000000` | `#3a3a3a` |
| red | `#fb5a4b` | `#ff7a6e` |
| green | `#34d399` | `#46d889` |
| yellow | `#ffb454` | `#ffc679` |
| blue | `#0a84ff` | `#3b9bff` |
| magenta | `#9a86ff` | `#b07cff` |
| cyan | `#57cdef` | `#7fdcf5` |
| white | `#cfcfcf` | `#ededed` |

## Architecture

### Extension structure

```
~/code/github.com/0x63616c/cursor-theme/
  package.json                 # manifest, contributes.themes
  themes/
    blackout-dark.json         # the generated theme (colors + tokenColors + semanticTokenColors)
  palette/
    palette.json               # single source of truth: named tokens -> hex
  scripts/
    build.ts                   # palette.json -> themes/blackout-dark.json
    validate.ts                # schema + invariant checks (test target)
    install.sh                 # symlink project into ~/.cursor/extensions
  test/
    theme.test.ts              # TDD: invariants on the built theme
  docs/superpowers/specs/...   # this spec
```

**Single source of truth:** `palette/palette.json` holds named roles
(`bg`, `accent`, `kw`, `str`, …) → hex. `build.ts` maps those names onto the
hundreds of VS Code workbench keys, TextMate scopes, and semantic token rules,
emitting `themes/blackout-dark.json`. This keeps color edits to one small file
(and is the seam the Phase 2 builder will later write to).

### Install (symlink)

`scripts/install.sh` symlinks the project dir to
`~/.cursor/extensions/blackout-theme` (or copies if symlink is rejected). After
`Developer: Reload Window` (or restart), "Blackout" appears in the theme picker.
Editing colors = rebuild + reload, no repackage.

### Fonts (separate from the theme)

A color theme cannot set fonts. Handled out-of-band:
1. Check whether **Geist** and **Geist Mono** are installed (macOS:
   `~/Library/Fonts` / system fonts). Install if missing (download from Vercel's
   Geist font release; user confirms).
2. Provide a `settings.json` snippet:
   ```json
   {
     "editor.fontFamily": "Geist Mono, ui-monospace, monospace",
     "editor.fontLigatures": true,
     "editor.fontSize": 13,
     "workbench.colorTheme": "Blackout",
     "editor.bracketPairColorization.enabled": true,
     "editor.guides.bracketPairs": "active"
   }
   ```
   (UI font via `window` settings where supported.)

### Workbench color coverage

`build.ts` must set at minimum these key groups so nothing falls back to the
default theme (which would reintroduce non-black surfaces / shadows):

- **Base:** `foreground`, `focusBorder` (`#0a84ff`), `contrastBorder`,
  `widget.shadow` → `#00000000` (kill shadows), `sash.hoverBorder`.
- **Editor:** `editor.background` `#000000`, `editor.foreground` `#ededed`,
  `editor.lineHighlightBackground` `#0a0a0a`, `editor.lineHighlightBorder`
  `#00000000`, `editor.selectionBackground` `#232323`,
  `editorCursor.foreground` `#0a84ff`, `editorLineNumber.foreground` `#3a3a3a`,
  `editorLineNumber.activeForeground` `#8a8a8a`,
  `editorIndentGuide.*`, `editorBracketHighlight.foreground1..6`,
  `editorBracketMatch.*`, `editorWhitespace.foreground`.
- **Gutter/overview:** `editorGutter.*` (added emerald, modified amber, deleted
  red), `editorOverviewRuler.*` with transparent border.
- **Sidebar / activity bar:** `sideBar.background` `#000000`,
  `sideBar.border` `#1a1a1a`, `activityBar.background` `#000000`,
  `activityBar.activeBorder` `#0a84ff`, `activityBarBadge.background` `#0a84ff`,
  `list.activeSelectionBackground` `#0a0a0a`,
  `list.activeSelectionForeground` `#ededed`,
  `list.inactiveSelectionBackground` `#0a0a0a`,
  `list.hoverBackground` `#0a0a0a`, git decoration colors.
- **Tabs:** `editorGroupHeader.tabsBackground` `#000000`,
  `tab.activeBackground` `#000000`, `tab.activeBorderTop`/`tab.activeBorder`
  `#0a84ff`, `tab.inactiveForeground` `#6a6a6a`, `tab.border` `#1a1a1a`,
  `editorGroup.border` `#1a1a1a`.
- **Status bar:** `statusBar.background` `#000000`,
  `statusBar.border` `#1a1a1a`, `statusBar.foreground` `#8a8a8a`,
  `statusBarItem.remoteBackground` `#0a84ff`.
- **Panels / terminal:** `panel.background` `#000000`, `panel.border`
  `#1a1a1a`, `terminal.background` `#000000`, `terminal.foreground` `#ededed`,
  the 16 ANSI colors, `terminalCursor.foreground` `#0a84ff`.
- **Inputs / dropdowns / buttons:** `input.background` `#000000`,
  `input.border` `#1a1a1a`, `button.background` `#ededed`,
  `button.foreground` `#000000`, `button.hoverBackground` `#d4d4d4`,
  `badge.background` `#0a84ff`, `dropdown.background` `#000000`.
- **Quick pick / command palette:** `quickInput.background` `#000000`,
  `pickerGroup.border` `#1a1a1a`, `quickInputList.focusBackground` `#0a0a0a`.
- **Diffs / merge / git:** added emerald, removed red, modified amber, all
  backgrounds tinted at low alpha over black.
- **Notifications / hovers / peek:** black bg, hairline border, no shadow.

## Build order (Phase 1)

1. **Install-proof slice.** Minimal `package.json` + a tiny
   `themes/blackout-dark.json` (just `editor.background` `#000000`,
   `editor.foreground` `#ededed`, a couple of token rules). Run `install.sh`,
   reload Cursor, confirm "Blackout" is selectable and the editor goes black.
   *Gate: do not proceed until this is visually confirmed in Cursor.*
2. **Palette source + build script.** Author `palette/palette.json`; write
   `build.ts` mapping palette → full workbench `colors`.
3. **Syntax mapping.** TextMate `tokenColors` + `semanticTokenColors` for
   accurate TS/TSX, mapping every role in the palette table.
4. **Full coverage pass.** Fill all workbench key groups above; verify no
   default-theme fallback surfaces remain (visual sweep across editor, sidebar,
   terminal, diff, command palette, notifications).
5. **Font setup.** Detect/install Geist + Geist Mono; apply settings snippet.
6. **Polish loop.** Tune against real files in Cursor; iterate palette.json.

## Testing (TDD)

Per project policy, each unit lands with a failing test first. The theme is data,
so tests are invariant checks in `test/theme.test.ts` run against the built
`themes/blackout-dark.json` (build runs in test setup):

- **Schema:** validates against the VS Code color-theme JSON schema.
- **True black:** `editor.background`, `sideBar.background`,
  `activityBar.background`, `statusBar.background`, `panel.background`,
  `terminal.background` all exactly `#000000`.
- **No shadows:** every key ending in `.shadow` is `#00000000` (fully
  transparent) or absent.
- **Palette integrity:** every named role in `palette.json` is referenced at
  least once in the output; no hard-coded hex in the output that isn't in the
  palette (build emits only palette colors + transparent).
- **Token coverage:** each syntax role (keyword, string, function, type,
  number, comment, punctuation, variable) has at least one scope rule and one
  `semanticTokenColors` entry.
- **Contrast floor:** foreground vs `#000000` meets a minimum contrast ratio
  (e.g. ≥ 4.5:1 for default text; ≥ 3:1 for syntax tokens) — guards against an
  unreadable token slipping in.
- **Accent consistency:** `focusBorder`, `editorCursor.foreground`,
  `tab.activeBorder`, `activityBar.activeBorder` all equal `#0a84ff`.

Each invariant is written as a failing test before the build logic that
satisfies it exists.

## Phase 2 (deferred — separate spec)

A local web app: load `palette.json`, edit roles with color pickers, live
editor-accurate preview, export back to `palette.json` / built theme. The Phase
1 palette-as-single-source-of-truth design is the integration seam. Not built
here.

## Risks / open questions

- **Cursor extension dir quirks.** Cursor mostly mirrors VS Code's
  `~/.cursor/extensions` layout; if symlink loading misbehaves, fall back to a
  copy step in `install.sh` (or `cursor --install-extension` of a packaged
  `.vsix`). The install-proof slice surfaces this on day one.
- **Semantic vs TextMate conflicts.** Semantic highlighting can override
  TextMate scopes; both layers must agree per role, verified by the token
  coverage + a manual TS/TSX sweep.
- **Geist Mono ligature coverage.** Confirm the installed Geist Mono build
  actually ships the ligatures; if not, ligatures setting is a harmless no-op.
