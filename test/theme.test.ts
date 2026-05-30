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
