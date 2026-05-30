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

test("current line + selection are the quiet grays", () => {
  expect(theme.colors["editor.lineHighlightBackground"]).toBe("#0a0a0a");
  expect(theme.colors["editor.lineHighlightBorder"]).toBe("#00000000");
  expect(theme.colors["editor.selectionBackground"]).toBe("#232323");
  expect(theme.colors["editorLineNumber.foreground"]).toBe("#3a3a3a");
  expect(theme.colors["editorLineNumber.activeForeground"]).toBe("#8a8a8a");
});

test("chrome surfaces stay black with white primary button", () => {
  expect(theme.colors["tab.activeBackground"]).toBe("#000000");
  expect(theme.colors["tab.inactiveForeground"]).toBe("#6a6a6a");
  expect(theme.colors["button.background"]).toBe("#ededed");
  expect(theme.colors["button.foreground"]).toBe("#000000");
  expect(theme.colors["list.activeSelectionBackground"]).toBe("#0a0a0a");
  expect(theme.colors["input.background"]).toBe("#000000");
  expect(theme.colors["quickInput.background"]).toBe("#000000");
});

test("git + terminal map to the semantic palette", () => {
  expect(theme.colors["gitDecoration.addedResourceForeground"]).toBe("#34d399");
  expect(theme.colors["gitDecoration.modifiedResourceForeground"]).toBe("#ffb454");
  expect(theme.colors["gitDecoration.deletedResourceForeground"]).toBe("#fb5a4b");
  expect(theme.colors["terminal.ansiBlue"]).toBe("#0a84ff");
  expect(theme.colors["terminal.ansiGreen"]).toBe("#34d399");
  expect(theme.colors["terminal.ansiRed"]).toBe("#fb5a4b");
});

test("bracket pairs cycle 3 muted hues", () => {
  expect(theme.colors["editorBracketHighlight.foreground1"]).toBe("#6f9bff");
  expect(theme.colors["editorBracketHighlight.foreground2"]).toBe("#e0b06a");
  expect(theme.colors["editorBracketHighlight.foreground3"]).toBe("#5cc593");
  expect(theme.colors["editorBracketHighlight.foreground4"]).toBe("#6f9bff");
  expect(theme.colors["editorBracketHighlight.unexpectedBracket.foreground"]).toBe("#fb5a4b");
});

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
