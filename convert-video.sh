#!/bin/bash
# Convert video to 1920x1080 MP4 without audio

ffmpeg -i input.mov \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 \
  -preset medium \
  -crf 23 \
  -an \
  -movflags +faststart \
  snapfix-preview.mp4

echo "Done! Output: snapfix-preview.mp4"
