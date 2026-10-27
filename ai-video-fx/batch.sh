#!/usr/bin/env bash
# Render every episode from its own pair of Flow clips, then the showreel.
# Put clips in <clipsDir> named <fx>-a.mp4 and <fx>-b.mp4 (see FLOW_BATCH.md).
# An effect without its own pair falls back to base-a.mp4 + base-b.mp4.
# usage: ai-video-fx/batch.sh <clipsDir> <outDir>
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
CLIPS="$(cd "$1" && pwd)"; OUT="$(mkdir -p "$2" && cd "$2" && pwd)"
join() { # a.mp4 b.mp4 out.mp4 (audio dropped: Flow Lite clips are silent)
  ffmpeg -v error -y -i "$1" -i "$2" -filter_complex \
    "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1[a];[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1[b];[a][b]concat=n=2:v=1[v]" \
    -map "[v]" -c:v libx264 -crf 18 -pix_fmt yuv420p "$3"
}
join "$CLIPS/base-a.mp4" "$CLIPS/base-b.mp4" "$OUT/base.mp4"
for fx in glass-widgets documentary orbit split spotlight checklist timeline; do
  src="$OUT/base.mp4"
  if [[ -f "$CLIPS/$fx-a.mp4" && -f "$CLIPS/$fx-b.mp4" ]]; then
    src="$OUT/$fx-base.mp4"; join "$CLIPS/$fx-a.mp4" "$CLIPS/$fx-b.mp4" "$src"
  fi
  node "$HERE/render.mjs" "$src" "$OUT/.runs/$fx" "$fx"
  mv "$OUT/.runs/$fx/$fx.mp4" "$OUT/$fx.mp4"
done
node "$HERE/render.mjs" "$OUT/base.mp4" "$OUT" none --showreel
echo "done → $OUT"
