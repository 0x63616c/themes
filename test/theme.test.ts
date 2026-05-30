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
