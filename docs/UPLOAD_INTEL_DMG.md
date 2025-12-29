# Upload Intel x64 DMG to Google Cloud Storage

## Step 1: Build Intel Version (if not already built)

If you haven't built the Intel version yet:

```bash
cd /Users/hrithikthakur/Code/flickfix

# Build for Intel x64 only
electron-builder --mac --x64 --config.mac.target=dmg

# Or build both architectures
npm run build:direct
```

This will create: `dist/flickfix-0.1.0.dmg` (Intel version)

## Step 2: Upload to Google Cloud Storage

```bash
# Upload Intel version
gsutil cp dist/flickfix-0.1.0.dmg gs://flickfix-downloads/

# Make it publicly accessible
gsutil iam ch allUsers:objectViewer gs://flickfix-downloads/flickfix-0.1.0.dmg

# Or make the entire bucket public (if not already)
gsutil iam ch allUsers:objectViewer gs://flickfix-downloads
```

## Step 3: Verify Upload

```bash
# List files in bucket
gsutil ls gs://flickfix-downloads/

# Test download URL
curl -I https://storage.googleapis.com/flickfix-downloads/flickfix-0.1.0.dmg
```

## Step 4: Update Landing Page

Update your landing page download links to include both versions:

- ARM64: `https://storage.googleapis.com/flickfix-downloads/flickfix-0.1.0-arm64.dmg`
- Intel: `https://storage.googleapis.com/flickfix-downloads/flickfix-0.1.0.dmg`

## Quick Commands

```bash
# 1. Check if Intel version exists
ls -lh dist/flickfix-0.1.0.dmg

# 2. If not, build it
npm run build:direct  # Builds both, or
electron-builder --mac --x64 --config.mac.target=dmg  # Intel only

# 3. Upload
gsutil cp dist/flickfix-0.1.0.dmg gs://flickfix-downloads/

# 4. Make public
gsutil iam ch allUsers:objectViewer gs://flickfix-downloads/flickfix-0.1.0.dmg
```

## Note

Building for Intel x64 on Apple Silicon may fail. If it does:
- Build on an Intel Mac
- Or use CI/CD (GitHub Actions, etc.)
- Or just host the ARM64 version (most new Macs are ARM)

