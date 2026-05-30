# Blackout Cursor Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Blackout", a true-black, shadow-free Cursor color-theme extension with a Punchy syntax palette and a Vercel-blue accent, installed locally via symlink.

**Architecture:** A single source-of-truth `palette/palette.json` (named roles → hex) is consumed by `scripts/theme.ts` (`buildTheme()`), which composes small section functions into the full VS Code theme object. `scripts/build.ts` writes it to `themes/blackout-dark.json`. Tests (`bun test`) assert invariants (true-black, no-shadow, accent consistency, token coverage, contrast). `scripts/install.sh` symlinks the project into `~/.cursor/extensions`.

**Tech Stack:** Bun (runtime + `bun:test`), TypeScript, plain JSON. No third-party deps.

---

## File Structure

| File | Responsibility |
|---|---|
| `package.json` | Extension manifest (`contributes.themes`) + Bun scripts |
| `palette/palette.json` | Single source of truth: named roles → hex |
| `scripts/theme.ts` | `buildTheme(palette)` — composes section fns into theme object |
| `scripts/build.ts` | CLI: writes `themes/blackout-dark.json` |
| `themes/blackout-dark.json` | Generated theme Cursor actually loads (committed) |
| `scripts/install.sh` | Symlink project into `~/.cursor/extensions` |
| `test/theme.test.ts` | Invariant tests over the built theme |
| `settings.recommended.json` | Font + theme settings snippet for the user |
| `README.md` | Install + tuning instructions |

Section functions inside `scripts/theme.ts` (each owns one slice of the theme): `baseColors`, `accentColors`, `noShadow`, `editorDetail`, `chromeColors`, `gitAndDiff`, `terminalColors`, `bracketColors`, `tokenColors`, `semanticTokens`.

---

## Task 1: Scaffold + install-proof slice

**Files:**
- Create: `package.json`
- Create: `themes/blackout-dark.json` (minimal placeholder, replaced by Task 2 build)
- Create: `scripts/install.sh`
- Create: `test/manifest.test.ts`

- [ ] **Step 1: Write the failing test**

`test/manifest.test.ts`:
```ts
import { test, expect } from "bun:test";
import { existsSync } from "node:fs";
import pkg from "../package.json";

test("manifest contributes the Blackout theme and the file exists", () => {
  const theme = pkg.contributes?.themes?.[0];
  expect(theme?.label).toBe("Blackout");
  expect(theme?.uiTheme).toBe("vs-dark");
  expect(existsSync(new URL("../" + theme!.path.replace(/^\.\//, ""), import.meta.url))).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/manifest.test.ts`
Expected: FAIL — `Cannot find module '../package.json'`.

- [ ] **Step 3: Write minimal implementation**

`package.json`:
```json
{
  "name": "blackout-theme",
  "displayName": "Blackout",
  "description": "True-black, shadow-free theme with a Punchy syntax palette.",
  "version": "0.0.1",
  "publisher": "0x63616c",
  "private": true,
  "engines": { "vscode": "^1.80.0" },
  "categories": ["Themes"],
  "contributes": {
    "themes": [
      { "label": "Blackout", "uiTheme": "vs-dark", "path": "./themes/blackout-dark.json" }
    ]
  },
  "scripts": {
    "build": "bun run scripts/build.ts",
    "test": "bun test"
  }
}
```

`themes/blackout-dark.json` (minimal, just enough to prove install):
```json
{
  "name": "Blackout",
  "type": "dark",
  "colors": {
    "editor.background": "#000000",
    "editor.foreground": "#ededed",
    "sideBar.background": "#000000",
    "activityBar.background": "#000000",
    "statusBar.background": "#000000"
  },
  "tokenColors": [
    { "scope": ["keyword"], "settings": { "foreground": "#9a86ff" } },
    { "scope": ["string"], "settings": { "foreground": "#46d889" } },
    { "scope": ["comment"], "settings": { "foreground": "#6a6a6a", "fontStyle": "italic" } }
  ]
}
```

`scripts/install.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$HOME/.cursor/extensions/blackout-theme"
rm -rf "$DEST"
if ln -s "$SRC" "$DEST" 2>/dev/null; then
  echo "Linked $SRC -> $DEST"
else
  cp -R "$SRC" "$DEST"
  echo "Copied $SRC -> $DEST (symlink unavailable)"
fi
echo "Now: Cmd+Shift+P > 'Developer: Reload Window', then pick 'Blackout' in the theme picker."
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/manifest.test.ts`
Expected: PASS.

- [ ] **Step 5: Install-proof in Cursor (manual gate)**

Run: `chmod +x scripts/install.sh && ./scripts/install.sh`
Then in Cursor: `Developer: Reload Window`, open the theme picker (`Cmd+K Cmd+T`), select **Blackout**.
Expected: editor + sidebar + activity bar + status bar go pure black; keywords periwinkle, strings green, comments gray italic.
**Do not proceed to Task 2 until this is visually confirmed.**

- [ ] **Step 6: Commit**

```bash
git add package.json themes/blackout-dark.json scripts/install.sh test/manifest.test.ts
git commit -m "feat: scaffold Blackout extension + install-proof slice"
```

---

## Task 2: Palette source + build skeleton + true-black surfaces

**Files:**
- Create: `palette/palette.json`
- Create: `scripts/theme.ts`
- Create: `scripts/build.ts`
- Create: `test/theme.test.ts`

- [ ] **Step 1: Write the failing test**

`test/theme.test.ts`:
```ts
import { test, expect } from "bun:test";
import { buildTheme } from "../scripts/theme";

const theme = buildTheme();

test("core surfaces are pure black", () => {
  for (const key of [
    "editor.background", "sideBar.background", "activityBar.background",
    "statusBar.background", "panel.background", "terminal.background",
  ]) {
    expect(theme.colors[key]).toBe("#000000");
  }
});

test("default foreground is set", () => {
  expect(theme.colors["editor.foreground"]).toBe("#ededed");
  expect(theme.colors["foreground"]).toBe("#ededed");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/theme.test.ts`
Expected: FAIL — `Cannot find module '../scripts/theme'`.

- [ ] **Step 3: Write minimal implementation**

`palette/palette.json`:
```json
{
  "transparent": "#00000000",
  "bg": "#000000",
  "currentLine": "#0a0a0a",
  "selection": "#232323",
  "border": "#1a1a1a",
  "borderStrong": "#2a2a2a",
  "fg": "#ededed",
  "fgMuted": "#8a8a8a",
  "fgFaint": "#5a5a5a",
  "lineNr": "#3a3a3a",
  "lineNrActive": "#8a8a8a",
  "accent": "#0a84ff",
  "accentBright": "#3b9bff",
  "neutral": "#ededed",
  "success": "#34d399",
  "warning": "#ffb454",
  "error": "#fb5a4b",
  "errorBright": "#ff7a6e",
  "kw": "#9a86ff",
  "kwBright": "#b07cff",
  "str": "#46d889",
  "fn": "#ffb454",
  "fnBright": "#ffc679",
  "type": "#57cdef",
  "typeBright": "#7fdcf5",
  "num": "#f47ea0",
  "comment": "#6a6a6a",
  "punct": "#9a9a9a",
  "var": "#ededed",
  "bracket1": "#6f9bff",
  "bracket2": "#e0b06a",
  "bracket3": "#5cc593",
  "ansiWhite": "#cfcfcf"
}
```

`scripts/theme.ts`:
```ts
import palette from "../palette/palette.json";

export type Palette = typeof palette;

/** Append an 8-bit alpha (e.g. "26") to a "#rrggbb" color. */
export function alpha(hex: string, aa: string): string {
  return hex + aa;
}

export function buildTheme(p: Palette = palette) {
  const colors: Record<string, string> = {
    ...baseColors(p),
  };
  return {
    name: "Blackout",
    type: "dark" as const,
    semanticHighlighting: true,
    colors,
    tokenColors: [] as Array<{ scope: string[]; settings: { foreground?: string; fontStyle?: string } }>,
    semanticTokenColors: {} as Record<string, string | { foreground?: string; fontStyle?: string }>,
  };
}

function baseColors(p: Palette): Record<string, string> {
  return {
    "foreground": p.fg,
    "descriptionForeground": p.fgMuted,
    "errorForeground": p.error,
    "editor.background": p.bg,
    "editor.foreground": p.fg,
    "sideBar.background": p.bg,
    "sideBar.foreground": p.fgMuted,
    "sideBar.border": p.border,
    "activityBar.background": p.bg,
    "activityBar.foreground": p.fg,
    "activityBar.inactiveForeground": p.fgFaint,
    "activityBar.border": p.border,
    "statusBar.background": p.bg,
    "statusBar.foreground": p.fgMuted,
    "statusBar.border": p.border,
    "panel.background": p.bg,
    "panel.border": p.border,
    "terminal.background": p.bg,
    "terminal.foreground": p.fg,
    "titleBar.activeBackground": p.bg,
    "titleBar.activeForeground": p.fg,
    "titleBar.border": p.border,
    "editorGroupHeader.tabsBackground": p.bg,
    "editorGroup.border": p.border,
  };
}
```

`scripts/build.ts`:
```ts
import { buildTheme } from "./theme";

const out = JSON.stringify(buildTheme(), null, 2) + "\n";
await Bun.write("themes/blackout-dark.json", out);
console.log("Wrote themes/blackout-dark.json");
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/theme.test.ts`
Expected: PASS (both tests).

- [ ] **Step 5: Regenerate the theme + commit**

```bash
bun run build
git add palette/palette.json scripts/theme.ts scripts/build.ts test/theme.test.ts themes/blackout-dark.json
git commit -m "feat: palette source + build skeleton with true-black surfaces"
```

---

## Task 3: Accent consistency + no-shadow invariants

**Files:**
- Modify: `scripts/theme.ts` (add `accentColors`, `noShadow`, wire into `buildTheme`)
- Modify: `test/theme.test.ts` (append tests)

- [ ] **Step 1: Write the failing test**

Append to `test/theme.test.ts`:
```ts
test("the accent is used consistently", () => {
  for (const key of [
    "focusBorder", "editorCursor.foreground",
    "tab.activeBorder", "activityBar.activeBorder", "badge.background",
  ]) {
    expect(theme.colors[key]).toBe("#0a84ff");
  }
});

test("no live shadows", () => {
  for (const [key, value] of Object.entries(theme.colors)) {
    if (key.endsWith(".shadow")) expect(value).toBe("#00000000");
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/theme.test.ts`
Expected: FAIL — accent keys are `undefined`.

- [ ] **Step 3: Write minimal implementation**

In `scripts/theme.ts`, change the `colors` spread in `buildTheme`:
```ts
  const colors: Record<string, string> = {
    ...baseColors(p),
    ...accentColors(p),
    ...noShadow(p),
  };
```

Add these functions to `scripts/theme.ts`:
```ts
function accentColors(p: Palette): Record<string, string> {
  return {
    "focusBorder": p.accent,
    "editorCursor.foreground": p.accent,
    "tab.activeBorder": p.accent,
    "tab.activeBorderTop": p.accent,
    "activityBar.activeBorder": p.accent,
    "activityBarBadge.background": p.accent,
    "activityBarBadge.foreground": p.bg,
    "badge.background": p.accent,
    "badge.foreground": p.bg,
    "textLink.foreground": p.accent,
    "textLink.activeForeground": p.accentBright,
    "progressBar.background": p.accent,
    "statusBarItem.remoteBackground": p.accent,
    "statusBarItem.remoteForeground": p.bg,
    "selection.background": alpha(p.accent, "44"),
  };
}

function noShadow(p: Palette): Record<string, string> {
  return {
    "widget.shadow": p.transparent,
    "scrollbar.shadow": p.transparent,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/theme.test.ts`
Expected: PASS (all tests).

- [ ] **Step 5: Regenerate + commit**

```bash
bun run build
git add scripts/theme.ts test/theme.test.ts themes/blackout-dark.json
git commit -m "feat: accent consistency + kill shadows"
```

---

## Task 4: Editor detail (selection, current line, line numbers, indent guides, bracket match)

**Files:**
- Modify: `scripts/theme.ts` (add `editorDetail`, wire in)
- Modify: `test/theme.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `test/theme.test.ts`:
```ts
test("current line + selection are the quiet grays", () => {
  expect(theme.colors["editor.lineHighlightBackground"]).toBe("#0a0a0a");
  expect(theme.colors["editor.lineHighlightBorder"]).toBe("#00000000");
  expect(theme.colors["editor.selectionBackground"]).toBe("#232323");
  expect(theme.colors["editorLineNumber.foreground"]).toBe("#3a3a3a");
  expect(theme.colors["editorLineNumber.activeForeground"]).toBe("#8a8a8a");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/theme.test.ts`
Expected: FAIL — keys `undefined`.

- [ ] **Step 3: Write minimal implementation**

Add `...editorDetail(p),` to the `colors` spread in `buildTheme`, then add:
```ts
function editorDetail(p: Palette): Record<string, string> {
  return {
    "editor.lineHighlightBackground": p.currentLine,
    "editor.lineHighlightBorder": p.transparent,
    "editor.selectionBackground": p.selection,
    "editor.selectionHighlightBackground": alpha(p.selection, "99"),
    "editor.inactiveSelectionBackground": alpha(p.selection, "80"),
    "editor.wordHighlightBackground": alpha(p.selection, "99"),
    "editor.findMatchBackground": alpha(p.accent, "55"),
    "editor.findMatchHighlightBackground": alpha(p.accent, "33"),
    "editorLineNumber.foreground": p.lineNr,
    "editorLineNumber.activeForeground": p.lineNrActive,
    "editorIndentGuide.background1": p.border,
    "editorIndentGuide.activeBackground1": p.borderStrong,
    "editorWhitespace.foreground": p.border,
    "editorBracketMatch.background": p.transparent,
    "editorBracketMatch.border": p.borderStrong,
    "editorRuler.foreground": p.border,
    "editorGutter.background": p.bg,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/theme.test.ts`
Expected: PASS.

- [ ] **Step 5: Regenerate + commit**

```bash
bun run build
git add scripts/theme.ts test/theme.test.ts themes/blackout-dark.json
git commit -m "feat: editor detail colors (selection, current line, gutters)"
```

---

## Task 5: Chrome (tabs, lists, inputs, buttons, quick pick)

**Files:**
- Modify: `scripts/theme.ts` (add `chromeColors`, wire in)
- Modify: `test/theme.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `test/theme.test.ts`:
```ts
test("chrome surfaces stay black with white primary button", () => {
  expect(theme.colors["tab.activeBackground"]).toBe("#000000");
  expect(theme.colors["tab.inactiveForeground"]).toBe("#6a6a6a");
  expect(theme.colors["button.background"]).toBe("#ededed");
  expect(theme.colors["button.foreground"]).toBe("#000000");
  expect(theme.colors["list.activeSelectionBackground"]).toBe("#0a0a0a");
  expect(theme.colors["input.background"]).toBe("#000000");
  expect(theme.colors["quickInput.background"]).toBe("#000000");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/theme.test.ts`
Expected: FAIL — keys `undefined`.

- [ ] **Step 3: Write minimal implementation**

Add `...chromeColors(p),` to the spread, then add:
```ts
function chromeColors(p: Palette): Record<string, string> {
  return {
    "tab.activeBackground": p.bg,
    "tab.inactiveBackground": p.bg,
    "tab.activeForeground": p.fg,
    "tab.inactiveForeground": "#6a6a6a",
    "tab.border": p.border,
    "tab.hoverBackground": p.currentLine,
    "tab.unfocusedActiveBorder": p.border,
    "list.activeSelectionBackground": p.currentLine,
    "list.activeSelectionForeground": p.fg,
    "list.inactiveSelectionBackground": p.currentLine,
    "list.inactiveSelectionForeground": p.fg,
    "list.hoverBackground": p.currentLine,
    "list.focusOutline": p.accent,
    "button.background": p.neutral,
    "button.foreground": p.bg,
    "button.hoverBackground": "#d4d4d4",
    "button.secondaryBackground": p.currentLine,
    "button.secondaryForeground": p.fg,
    "input.background": p.bg,
    "input.foreground": p.fg,
    "input.border": p.border,
    "input.placeholderForeground": p.fgFaint,
    "inputOption.activeBorder": p.accent,
    "dropdown.background": p.bg,
    "dropdown.border": p.border,
    "dropdown.foreground": p.fg,
    "quickInput.background": p.bg,
    "quickInput.foreground": p.fg,
    "pickerGroup.border": p.border,
    "pickerGroup.foreground": p.accent,
    "quickInputList.focusBackground": p.currentLine,
    "editorWidget.background": p.bg,
    "editorWidget.border": p.border,
    "editorHoverWidget.background": p.bg,
    "editorHoverWidget.border": p.border,
    "editorSuggestWidget.background": p.bg,
    "editorSuggestWidget.border": p.border,
    "editorSuggestWidget.selectedBackground": p.currentLine,
    "notifications.background": p.bg,
    "notifications.border": p.border,
    "scrollbarSlider.background": alpha(p.fg, "1a"),
    "scrollbarSlider.hoverBackground": alpha(p.fg, "2a"),
    "scrollbarSlider.activeBackground": alpha(p.fg, "3a"),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/theme.test.ts`
Expected: PASS.

- [ ] **Step 5: Regenerate + commit**

```bash
bun run build
git add scripts/theme.ts test/theme.test.ts themes/blackout-dark.json
git commit -m "feat: chrome colors (tabs, lists, inputs, buttons, quick pick)"
```

---

## Task 6: Git decorations, diffs, terminal ANSI

**Files:**
- Modify: `scripts/theme.ts` (add `gitAndDiff`, `terminalColors`, wire in)
- Modify: `test/theme.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `test/theme.test.ts`:
```ts
test("git + terminal map to the semantic palette", () => {
  expect(theme.colors["gitDecoration.addedResourceForeground"]).toBe("#34d399");
  expect(theme.colors["gitDecoration.modifiedResourceForeground"]).toBe("#ffb454");
  expect(theme.colors["gitDecoration.deletedResourceForeground"]).toBe("#fb5a4b");
  expect(theme.colors["terminal.ansiBlue"]).toBe("#0a84ff");
  expect(theme.colors["terminal.ansiGreen"]).toBe("#34d399");
  expect(theme.colors["terminal.ansiRed"]).toBe("#fb5a4b");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/theme.test.ts`
Expected: FAIL — keys `undefined`.

- [ ] **Step 3: Write minimal implementation**

Add `...gitAndDiff(p),` and `...terminalColors(p),` to the spread, then add:
```ts
function gitAndDiff(p: Palette): Record<string, string> {
  return {
    "gitDecoration.addedResourceForeground": p.success,
    "gitDecoration.modifiedResourceForeground": p.warning,
    "gitDecoration.deletedResourceForeground": p.error,
    "gitDecoration.untrackedResourceForeground": p.success,
    "gitDecoration.ignoredResourceForeground": p.fgFaint,
    "gitDecoration.conflictingResourceForeground": p.kw,
    "editorGutter.addedBackground": p.success,
    "editorGutter.modifiedBackground": p.warning,
    "editorGutter.deletedBackground": p.error,
    "diffEditor.insertedTextBackground": alpha(p.success, "20"),
    "diffEditor.removedTextBackground": alpha(p.error, "20"),
    "diffEditor.insertedLineBackground": alpha(p.success, "14"),
    "diffEditor.removedLineBackground": alpha(p.error, "14"),
    "editorError.foreground": p.error,
    "editorWarning.foreground": p.warning,
    "editorInfo.foreground": p.accent,
    "minimapGutter.addedBackground": p.success,
    "minimapGutter.modifiedBackground": p.warning,
    "minimapGutter.deletedBackground": p.error,
  };
}

function terminalColors(p: Palette): Record<string, string> {
  return {
    "terminalCursor.foreground": p.accent,
    "terminal.ansiBlack": p.bg,
    "terminal.ansiBrightBlack": p.lineNr,
    "terminal.ansiRed": p.error,
    "terminal.ansiBrightRed": p.errorBright,
    "terminal.ansiGreen": p.success,
    "terminal.ansiBrightGreen": p.str,
    "terminal.ansiYellow": p.warning,
    "terminal.ansiBrightYellow": p.fnBright,
    "terminal.ansiBlue": p.accent,
    "terminal.ansiBrightBlue": p.accentBright,
    "terminal.ansiMagenta": p.kw,
    "terminal.ansiBrightMagenta": p.kwBright,
    "terminal.ansiCyan": p.type,
    "terminal.ansiBrightCyan": p.typeBright,
    "terminal.ansiWhite": p.ansiWhite,
    "terminal.ansiBrightWhite": p.fg,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/theme.test.ts`
Expected: PASS.

- [ ] **Step 5: Regenerate + commit**

```bash
bun run build
git add scripts/theme.ts test/theme.test.ts themes/blackout-dark.json
git commit -m "feat: git decorations, diffs, terminal ANSI"
```

---

## Task 7: Bracket-pair colors (subtle, 3 muted hues)

**Files:**
- Modify: `scripts/theme.ts` (add `bracketColors`, wire in)
- Modify: `test/theme.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `test/theme.test.ts`:
```ts
test("bracket pairs cycle 3 muted hues", () => {
  expect(theme.colors["editorBracketHighlight.foreground1"]).toBe("#6f9bff");
  expect(theme.colors["editorBracketHighlight.foreground2"]).toBe("#e0b06a");
  expect(theme.colors["editorBracketHighlight.foreground3"]).toBe("#5cc593");
  expect(theme.colors["editorBracketHighlight.foreground4"]).toBe("#6f9bff");
  expect(theme.colors["editorBracketHighlight.unexpectedBracket.foreground"]).toBe("#fb5a4b");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/theme.test.ts`
Expected: FAIL — keys `undefined`.

- [ ] **Step 3: Write minimal implementation**

Add `...bracketColors(p),` to the spread, then add:
```ts
function bracketColors(p: Palette): Record<string, string> {
  return {
    "editorBracketHighlight.foreground1": p.bracket1,
    "editorBracketHighlight.foreground2": p.bracket2,
    "editorBracketHighlight.foreground3": p.bracket3,
    "editorBracketHighlight.foreground4": p.bracket1,
    "editorBracketHighlight.foreground5": p.bracket2,
    "editorBracketHighlight.foreground6": p.bracket3,
    "editorBracketHighlight.unexpectedBracket.foreground": p.error,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/theme.test.ts`
Expected: PASS.

- [ ] **Step 5: Regenerate + commit**

```bash
bun run build
git add scripts/theme.ts test/theme.test.ts themes/blackout-dark.json
git commit -m "feat: subtle bracket-pair colorization"
```

---

## Task 8: Syntax — tokenColors + semanticTokenColors

**Files:**
- Modify: `scripts/theme.ts` (add `tokenColors`, `semanticTokens`, wire into return)
- Modify: `test/theme.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `test/theme.test.ts`:
```ts
const ROLES: Record<string, string> = {
  keyword: "#9a86ff", string: "#46d889", function: "#ffb454",
  type: "#57cdef", number: "#f47ea0", comment: "#6a6a6a",
  punctuation: "#9a9a9a", variable: "#ededed",
};

test("every syntax role has a TextMate scope rule with its color", () => {
  const used = theme.tokenColors.flatMap(r => r.settings.foreground ? [r.settings.foreground] : []);
  for (const hex of Object.values(ROLES)) {
    expect(used).toContain(hex);
  }
});

test("comments are italic in both layers", () => {
  const tm = theme.tokenColors.find(r => r.scope.includes("comment"));
  expect(tm?.settings.fontStyle).toBe("italic");
  const sem = theme.semanticTokenColors["comment"];
  expect(typeof sem === "object" && sem.fontStyle).toBe("italic");
});

test("semantic tokens cover the core roles", () => {
  for (const key of ["keyword", "string", "number", "function", "type", "variable"]) {
    expect(theme.semanticTokenColors[key]).toBeDefined();
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/theme.test.ts`
Expected: FAIL — `tokenColors` empty, `semanticTokenColors` empty.

- [ ] **Step 3: Write minimal implementation**

In `buildTheme`, replace the `tokenColors`/`semanticTokenColors` lines:
```ts
    colors,
    tokenColors: tokenColors(p),
    semanticTokenColors: semanticTokens(p),
```

Add to `scripts/theme.ts`:
```ts
function tokenColors(p: Palette) {
  return [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: p.comment, fontStyle: "italic" } },
    { scope: ["keyword", "storage", "storage.type", "storage.modifier", "keyword.control", "keyword.operator.new", "keyword.operator.expression"], settings: { foreground: p.kw } },
    { scope: ["string", "string.quoted", "string.template", "punctuation.definition.string"], settings: { foreground: p.str } },
    { scope: ["string.regexp", "constant.character.escape"], settings: { foreground: p.str } },
    { scope: ["constant.numeric", "constant.language", "constant.language.boolean", "constant.language.null", "constant.language.undefined"], settings: { foreground: p.num } },
    { scope: ["entity.name.function", "support.function", "meta.function-call.generic", "variable.function"], settings: { foreground: p.fn } },
    { scope: ["entity.name.type", "entity.name.class", "support.type", "support.class", "entity.other.inherited-class", "entity.name.namespace"], settings: { foreground: p.type } },
    { scope: ["entity.name.tag", "support.type.primitive", "support.type.builtin"], settings: { foreground: p.type } },
    { scope: ["entity.other.attribute-name"], settings: { foreground: p.fn } },
    { scope: ["variable", "variable.other", "variable.other.readwrite", "meta.definition.variable"], settings: { foreground: p.var } },
    { scope: ["variable.parameter"], settings: { foreground: p.var } },
    { scope: ["variable.other.property", "variable.other.object.property", "meta.object-literal.key", "support.variable.property"], settings: { foreground: p.var } },
    { scope: ["punctuation", "meta.brace", "keyword.operator", "punctuation.separator", "punctuation.terminator"], settings: { foreground: p.punct } },
    { scope: ["meta.decorator", "punctuation.decorator", "entity.name.function.decorator"], settings: { foreground: p.fn } },
    { scope: ["invalid", "invalid.illegal", "invalid.deprecated"], settings: { foreground: p.error } },
  ];
}

function semanticTokens(p: Palette): Record<string, string | { foreground?: string; fontStyle?: string }> {
  return {
    "keyword": p.kw,
    "string": p.str,
    "number": p.num,
    "boolean": p.num,
    "regexp": p.str,
    "function": p.fn,
    "method": p.fn,
    "function.declaration": p.fn,
    "type": p.type,
    "class": p.type,
    "interface": p.type,
    "enum": p.type,
    "enumMember": p.num,
    "typeParameter": p.type,
    "namespace": p.type,
    "variable": p.var,
    "variable.readonly": p.var,
    "parameter": p.var,
    "property": p.var,
    "decorator": p.fn,
    "operator": p.punct,
    "comment": { foreground: p.comment, fontStyle: "italic" },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/theme.test.ts`
Expected: PASS.

- [ ] **Step 5: Regenerate + commit**

```bash
bun run build
git add scripts/theme.ts test/theme.test.ts themes/blackout-dark.json
git commit -m "feat: Punchy syntax (tokenColors + semanticTokenColors)"
```

---

## Task 9: Integrity, contrast, and structure guards

**Files:**
- Modify: `test/theme.test.ts` (append guard tests — no `theme.ts` change expected; fix only if a guard fails)

- [ ] **Step 1: Write the failing test**

Append to `test/theme.test.ts`:
```ts
import palette from "../palette/palette.json";

function srgb(c: number) {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}
function luminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}
function contrast(a: string, b: string) {
  const la = luminance(a), lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const paletteValues = new Set(Object.values(palette));

test("every color in output is a palette color (opaque) or palette+alpha", () => {
  const values = [
    ...Object.values(theme.colors),
    ...theme.tokenColors.flatMap(r => r.settings.foreground ? [r.settings.foreground] : []),
  ];
  for (const v of values) {
    const base = v.length === 9 ? v.slice(0, 7) : v;
    expect(paletteValues.has(base) || base === "#000000").toBe(true);
  }
});

test("every palette role is referenced somewhere", () => {
  const serialized = JSON.stringify(theme);
  for (const [name, hex] of Object.entries(palette)) {
    if (name === "transparent") continue;
    expect(serialized.includes(hex)).toBe(true);
  }
});

test("text and tokens clear the contrast floor on black", () => {
  expect(contrast(palette.fg, palette.bg)).toBeGreaterThanOrEqual(4.5);
  for (const hex of [palette.kw, palette.str, palette.fn, palette.type, palette.num]) {
    expect(contrast(hex, palette.bg)).toBeGreaterThanOrEqual(3);
  }
});

test("shape is a valid theme document", () => {
  expect(theme.type).toBe("dark");
  expect(typeof theme.colors).toBe("object");
  expect(Array.isArray(theme.tokenColors)).toBe(true);
  for (const rule of theme.tokenColors) {
    expect(Array.isArray(rule.scope)).toBe(true);
    expect(typeof rule.settings).toBe("object");
  }
});
```

- [ ] **Step 2: Run test to verify it fails or surfaces a real gap**

Run: `bun test test/theme.test.ts`
Expected: New tests run. If "every palette role is referenced" fails, it means a palette entry is unused — either reference it in the relevant section function or delete it from `palette.json`. If a contrast test fails, lighten that token in `palette.json` (and update the corresponding test literal in earlier tasks). Fix until green.

- [ ] **Step 3: Make it green (only if a guard failed)**

Apply the minimal `palette.json` / `theme.ts` fix indicated by the failure. (If everything passed first try, no change needed.)

- [ ] **Step 4: Run the full suite**

Run: `bun test`
Expected: PASS (all files).

- [ ] **Step 5: Regenerate + commit**

```bash
bun run build
git add test/theme.test.ts palette/palette.json scripts/theme.ts themes/blackout-dark.json
git commit -m "test: integrity, contrast, and structure guards"
```

---

## Task 10: Fonts + settings snippet + README

**Files:**
- Create: `settings.recommended.json`
- Create: `scripts/check-fonts.sh`
- Create: `README.md`

- [ ] **Step 1: Write the failing test**

Append to `test/manifest.test.ts`:
```ts
import settings from "../settings.recommended.json";

test("recommended settings select Blackout + Geist Mono with ligatures", () => {
  expect(settings["workbench.colorTheme"]).toBe("Blackout");
  expect(settings["editor.fontFamily"]).toContain("Geist Mono");
  expect(settings["editor.fontLigatures"]).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/manifest.test.ts`
Expected: FAIL — `Cannot find module '../settings.recommended.json'`.

- [ ] **Step 3: Write minimal implementation**

`settings.recommended.json`:
```json
{
  "workbench.colorTheme": "Blackout",
  "editor.fontFamily": "Geist Mono, ui-monospace, SF Mono, monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 13,
  "editor.lineHeight": 1.7,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "editor.semanticHighlighting.enabled": true,
  "workbench.fontAliasing": "antialiased"
}
```

`scripts/check-fonts.sh`:
```bash
#!/usr/bin/env bash
# Reports whether Geist / Geist Mono are installed on macOS.
set -euo pipefail
for font in "Geist" "Geist Mono"; do
  if system_profiler SPFontsDataType 2>/dev/null | grep -qi "$font"; then
    echo "OK   $font installed"
  else
    echo "MISS $font not found — download from https://vercel.com/font and install (open the .otf, click Install)."
  fi
done
```

`README.md`:
```markdown
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/manifest.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
chmod +x scripts/check-fonts.sh
git add settings.recommended.json scripts/check-fonts.sh README.md test/manifest.test.ts
git commit -m "feat: font check, recommended settings, README"
```

---

## Task 11: Final install + manual polish gate

**Files:** none (verification only)

- [ ] **Step 1: Rebuild and run the full suite**

Run: `bun run build && bun test`
Expected: all tests PASS; `themes/blackout-dark.json` regenerated.

- [ ] **Step 2: Reinstall + reload**

Run: `./scripts/install.sh`
Then in Cursor: `Developer: Reload Window`, ensure **Blackout** is selected, and apply `settings.recommended.json`.

- [ ] **Step 3: Visual sweep (manual)**

Open a real TS/TSX file and check, against the spec's hero look:
- Editor, sidebar, activity bar, tabs, status bar, terminal, command palette (`Cmd+Shift+P`), notifications — all pure black, hairline separators, **no shadows / glows** anywhere.
- Syntax matches Punchy (keyword periwinkle, string green, function amber, type cyan, number rose, comment gray italic).
- Current line is a faint full-width band; selection is quiet gray.
- Make a git edit — modified file shows amber `M`, new file emerald `A`.
- Nested brackets show muted blue/amber/emerald.
Note any region still using a non-black surface and add it to the relevant section function in `scripts/theme.ts` (with a test), then rebuild.

- [ ] **Step 4: Commit any polish fixes**

```bash
git add -A
git commit -m "fix: polish pass — close theme coverage gaps from visual sweep"
```

---

## Self-Review (completed)

- **Spec coverage:** surfaces/true-black (T2), accent + no-shadow (T3), selection/current-line/line-numbers (T4), chrome groups (T5), git/diff/terminal ANSI (T6), brackets (T7), syntax + semantic (T8), integrity/contrast/structure tests (T9), fonts + settings snippet (T10), install-proof-first (T1) + final sweep (T11). All spec sections map to a task.
- **Placeholders:** none — every code step shows full code; the only "fill in" is the conditional fix in T9/T11, which is explicitly defined as a guard-driven minimal edit.
- **Type consistency:** `buildTheme()` returns `{ name, type, semanticHighlighting, colors, tokenColors, semanticTokenColors }` used identically across T2–T9; section fns return `Record<string,string>`; `alpha()` signature stable; palette role names match `palette.json` throughout.
