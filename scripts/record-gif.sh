#!/bin/bash
# Record codachi demo as GIF using asciinema + agg
# Install: pip install asciinema && cargo install --git https://github.com/asciinema/agg
# Or use: npm install -g svg-term-cli

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CAST_FILE="$ROOT_DIR/demo.cast"
GIF_FILE="$ROOT_DIR/codachi.gif"

cd "$ROOT_DIR"

# Build first
npm run build

echo "Recording demo..."
asciinema rec "$CAST_FILE" \
  --cols 120 \
  --rows 8 \
  --command "node dist/index.js demo" \
  --overwrite

echo "Converting to GIF..."
if command -v agg &> /dev/null; then
  agg "$CAST_FILE" "$GIF_FILE" \
    --font-size 14 \
    --theme monokai \
    --speed 1
  echo "GIF saved to $GIF_FILE"
elif command -v svg-term &> /dev/null; then
  svg-term --in "$CAST_FILE" --out "$ROOT_DIR/codachi.svg" --window --padding 10
  echo "SVG saved to codachi.svg (convert to GIF with any image tool)"
else
  echo "Install agg (cargo install --git https://github.com/asciinema/agg)"
  echo "Or svg-term-cli (npm i -g svg-term-cli)"
  echo "Cast file saved to $CAST_FILE"
fi
