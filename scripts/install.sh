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
