# App Store Preview Video Guide

## Requirements

- **Dimensions:** 1920 × 1080px (Full HD)
- **Format:** MP4
- **Duration:** 15-30 seconds (recommended)
- **File Size:** Keep under 500MB (Apple's limit)
- **Frame Rate:** 30fps (standard) or 60fps (smoother)

## How to Create App Preview Video

### Option 1: Screen Recording (Recommended)

1. **Prepare your app:**
   - Open flickfix
   - Set up a demo scenario
   - Close unnecessary windows
   - Make sure everything looks clean

2. **Record screen:**
   ```bash
   # Method 1: Use QuickTime Player
   # 1. Open QuickTime Player
   # 2. File → New Screen Recording
   # 3. Click Options → Set quality to Maximum
   # 4. Click Record
   # 5. Perform your demo
   # 6. Stop recording
   
   # Method 2: Use built-in screen recording (Cmd+Shift+5)
   # 1. Press Cmd+Shift+5
   # 2. Click "Record Entire Screen" or "Record Selected Portion"
   # 3. Set to 1920x1080 area
   # 4. Click Record
   ```

3. **Edit and export:**
   - Use iMovie, Final Cut Pro, or Adobe Premiere
   - Trim to 15-30 seconds
   - Export as MP4, 1920x1080, H.264 codec

### Option 2: Using FFmpeg (Command Line)

If you have a screen recording that needs resizing/formatting:

```bash
# Install FFmpeg (if not installed)
brew install ffmpeg

# Convert/resize to 1920x1080 MP4
ffmpeg -i input.mov \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 \
  -preset medium \
  -crf 23 \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  flickfix-preview.mp4

# Trim to 30 seconds
ffmpeg -i flickfix-preview.mp4 -t 30 -c copy flickfix-preview-30s.mp4

# Compress if file is too large
ffmpeg -i flickfix-preview.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 28 \
  -c:a aac \
  -b:a 96k \
  flickfix-preview-compressed.mp4
```

### Option 3: Using ScreenFlow or Camtasia

Professional screen recording tools:
- **ScreenFlow** (Mac): Great for screen recordings
- **Camtasia**: Cross-platform, good editing features
- Both can export directly to 1920x1080 MP4

## What to Show in Preview

### Recommended Sequence (15-30 seconds):

1. **Opening (0-3s):** App icon or logo animation
2. **Main Feature (3-10s):** Show fixing text - select text, press shortcut, see correction
3. **Settings (10-15s):** Quick glimpse of settings, API key setup
4. **Closing (15-30s):** Show it working in different apps (Notes, browser, etc.)

### Key Points to Highlight:

- ✅ **Fast correction** - Show instant typo fixing
- ✅ **Works everywhere** - Show in different apps
- ✅ **Simple shortcut** - Demonstrate Alt+Space
- ✅ **Privacy** - Mention "Your API key, your data"
- ✅ **Easy setup** - Quick onboarding

## Script Ideas

### 15-Second Version:
```
"Fix typos instantly, anywhere on your Mac.
Select text, press Alt+Space, done.
Works in every app.
Your API key, your privacy.
flickfix - Fix typos. Instantly."
```

### 30-Second Version:
```
"Tired of typos? flickfix fixes them instantly.
Select any text, press Alt+Space, and watch it correct.
Works in Notes, Mail, Slack, everywhere you type.
Powered by your own Gemini API key.
Your data stays private.
No subscriptions, no tracking.
flickfix - Fix typos. Instantly."
```

## Video Production Tips

1. **Keep it simple:** Don't overcomplicate
2. **Show real usage:** Use actual typos, not perfect text
3. **Smooth transitions:** Use fade or simple cuts
4. **Clear text:** Make sure UI text is readable
5. **Good lighting:** If showing your screen, ensure good visibility
6. **No audio needed:** App previews are usually silent, but you can add music

## Export Settings

### Recommended Export Settings:

- **Resolution:** 1920 × 1080
- **Frame Rate:** 30 fps (or 60 fps for smoother motion)
- **Codec:** H.264
- **Bitrate:** 5-10 Mbps (adjust for file size)
- **Audio:** AAC, 128 kbps (if including audio)
- **Container:** MP4

### iMovie Export:
1. File → Share → File
2. Resolution: 1080p
3. Quality: High
4. Format: Video and Audio
5. Click Next → Save

### Final Cut Pro Export:
1. File → Share → Master File
2. Format: Video and Audio
3. Codec: H.264
4. Resolution: 1920 × 1080
5. Frame Rate: 30 fps
6. Export

## File Size Optimization

If your video is too large (>500MB):

```bash
# Compress video
ffmpeg -i flickfix-preview.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 28 \
  -maxrate 5M \
  -bufsize 10M \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  flickfix-preview-compressed.mp4
```

## Upload to App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app → App Store tab
3. Go to the version you're submitting
4. Scroll to "App Preview"
5. Click "+" to add preview
6. Upload your 1920x1080 MP4 file
7. Add a caption (optional but recommended)

## Checklist

- [ ] Video is 1920 × 1080px
- [ ] Format is MP4
- [ ] Duration is 15-30 seconds
- [ ] File size is under 500MB
- [ ] Shows key features clearly
- [ ] Text is readable
- [ ] Smooth playback (no stuttering)
- [ ] Uploaded to App Store Connect

## Tools Summary

| Tool | Best For | Cost |
|------|----------|------|
| QuickTime Player | Basic recording | Free (built-in) |
| iMovie | Simple editing | Free (built-in) |
| ScreenFlow | Professional screen recording | Paid |
| Camtasia | Cross-platform recording/editing | Paid |
| FFmpeg | Command-line processing | Free |
| Final Cut Pro | Professional editing | Paid |

## Quick Command Reference

```bash
# Record screen (built-in macOS)
# Press Cmd+Shift+5, select area, record

# Convert to MP4 with FFmpeg
ffmpeg -i input.mov -c:v libx264 -c:a aac output.mp4

# Resize to 1920x1080
ffmpeg -i input.mp4 -vf scale=1920:1080 output.mp4

# Trim to 30 seconds
ffmpeg -i input.mp4 -t 30 -c copy output.mp4

# Compress
ffmpeg -i input.mp4 -c:v libx264 -crf 28 output.mp4
```

Good luck creating your preview! 🎬

