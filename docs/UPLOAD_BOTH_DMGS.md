# Upload Both DMG Files to Google Cloud Storage

## URLs You Want

- ARM64: `https://storage.googleapis.com/snapfix-downloads/SnapFix-0.1.0-arm64.dmg`
- Intel: `https://storage.googleapis.com/snapfix-downloads/SnapFix-0.1.0.dmg`

## Step 1: Check What You Have

```bash
ls -lh dist/*.dmg
```

## Step 2: Build Intel Version (if needed)

If you don't have the Intel version:

```bash
# Build Intel only
npx electron-builder --mac --x64 --config.mac.target=dmg

# Or build both
npm run build:direct
```

## Step 3: Upload Both Files

```bash
# Upload ARM64 version (if not already uploaded)
gsutil cp dist/SnapFix-0.1.0-arm64.dmg gs://snapfix-downloads/

# Upload Intel version
gsutil cp dist/SnapFix-0.1.0.dmg gs://snapfix-downloads/

# Make both publicly accessible
gsutil iam ch allUsers:objectViewer gs://snapfix-downloads
```

## Step 4: Verify URLs Work

```bash
# Test ARM64 URL
curl -I https://storage.googleapis.com/snapfix-downloads/SnapFix-0.1.0-arm64.dmg

# Test Intel URL
curl -I https://storage.googleapis.com/snapfix-downloads/SnapFix-0.1.0.dmg
```

Both should return `HTTP/1.1 200 OK`

## Quick Commands

```bash
# Upload both at once
gsutil cp dist/SnapFix-0.1.0*.dmg gs://snapfix-downloads/

# Make public
gsutil iam ch allUsers:objectViewer gs://snapfix-downloads

# Verify
gsutil ls -lh gs://snapfix-downloads/
```

## After Upload

Your URLs will be:
- ✅ `https://storage.googleapis.com/snapfix-downloads/SnapFix-0.1.0-arm64.dmg`
- ✅ `https://storage.googleapis.com/snapfix-downloads/SnapFix-0.1.0.dmg`

Both will be publicly accessible and ready to use in your landing page!

