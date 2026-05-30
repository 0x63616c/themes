import palette from "../palette/palette.json";

export type Palette = typeof palette;

/** Append an 8-bit alpha (e.g. "26") to a "#rrggbb" color. */
export function alpha(hex: string, aa: string): string {
  return hex + aa;
}

export function buildTheme(p: Palette = palette) {
  const colors: Record<string, string> = {
    ...baseColors(p),
    ...accentColors(p),
    ...noShadow(p),
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
