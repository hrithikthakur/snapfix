# Download Files Setup

## Current Status

✅ Landing page updated with auto-detection
✅ Architecture detection JavaScript added
✅ Manual selection links added

## Required Files

You need both DMG files in the `downloads/` folder:

1. `SnapFix-0.1.0-arm64.dmg` - For Apple Silicon Macs (M1, M2, M3, etc.)
2. `SnapFix-0.1.0.dmg` - For Intel Macs

## Building Both Versions

### Option 1: Build Both at Once (Recommended)

```bash
cd /Users/hrithikthakur/Code/snapfix
source .env
npm run build:direct
```

This should create both DMG files. However, building for x64 on Apple Silicon may fail.

### Option 2: Build Separately

If building both at once fails:

```bash
# Build for Apple Silicon (current Mac)
electron-builder --mac --arm64 --config.mac.target=dmg

# Build for Intel (if you have access to Intel Mac, or use CI/CD)
electron-builder --mac --x64 --config.mac.target=dmg
```

### Option 3: Use CI/CD

Set up GitHub Actions or similar to build both architectures automatically.

## Copy Files to Landing Folder

After building, copy both DMG files:

```bash
# Copy ARM64 version (already done)
cp dist/SnapFix-0.1.0-arm64.dmg landing/downloads/

# Copy Intel version (when available)
cp dist/SnapFix-0.1.0.dmg landing/downloads/
```

## How Auto-Detection Works

The landing page will:

1. **Detect macOS**: Check if user is on macOS
2. **Detect Architecture**: 
   - Try User-Agent Client Hints API (modern browsers)
   - Check user agent string for architecture hints
   - Default to ARM64 (most modern Macs)
3. **Update Download Button**: Automatically set to correct DMG
4. **Show Manual Links**: Provide links to both versions as fallback

## Testing

1. Open `landing/index.html` in browser
2. Check that download button shows correct architecture
3. Test both manual selection links
4. Verify files download correctly

## Deployment

When deploying to Firebase:

```bash
cd landing
firebase deploy
```

Both DMG files will be served from the `downloads/` folder.

