# Prepare DMG Files for Website Download

Complete guide to build and upload the latest flickfix DMG files for website distribution.

## Quick Start

```bash
# Run the automated script
./scripts/prepare-download.sh
```

This will:
1. Build DMG files for both architectures
2. Upload to Google Cloud Storage
3. Make files publicly accessible
4. Show you the download URLs

## Manual Steps

### Step 1: Build DMG Files

```bash
cd /Users/hrithikthakur/Code/flickfix

# Build both ARM64 and x64 versions
npm run build:direct
```

This creates:
- `dist/flickfix-0.1.1-arm64.dmg` (Apple Silicon)
- `dist/flickfix-0.1.1-x64.dmg` (Intel Macs)

**Note:** Building x64 on Apple Silicon may fail. That's OK - ARM64 is the priority.

### Step 2: Verify Builds

```bash
# Check what was created
ls -lh dist/*.dmg

# Test the DMG (optional)
open dist/flickfix-0.1.1-arm64.dmg
```

### Step 3: Upload to Google Cloud Storage

```bash
# Upload ARM64 version
gsutil cp dist/flickfix-0.1.1-arm64.dmg gs://flickfix-downloads/

# Upload x64 version (if built)
gsutil cp dist/flickfix-0.1.1-x64.dmg gs://flickfix-downloads/

# Make files publicly accessible
gsutil iam ch allUsers:objectViewer gs://flickfix-downloads
```

### Step 4: Verify Upload

```bash
# List files in bucket
gsutil ls gs://flickfix-downloads/

# Test download URLs
curl -I https://storage.googleapis.com/flickfix-downloads/flickfix-0.1.1-arm64.dmg
curl -I https://storage.googleapis.com/flickfix-downloads/flickfix-0.1.1-x64.dmg
```

Both should return `HTTP/1.1 200 OK`.

### Step 5: Update Landing Page (Already Done)

The landing page has been updated to use version 0.1.1. The JavaScript will automatically:
- Detect user's architecture (ARM64 or x64)
- Set the correct download URL
- Fallback to ARM64 if detection fails

## Download URLs

After upload, your files will be available at:

- **ARM64 (Apple Silicon):** `https://storage.googleapis.com/flickfix-downloads/flickfix-0.1.1-arm64.dmg`
- **x64 (Intel):** `https://storage.googleapis.com/flickfix-downloads/flickfix-0.1.1-x64.dmg`

## Landing Page Auto-Detection

The landing page (`landing/index.html`) automatically:
1. Detects if user is on macOS
2. Detects architecture (ARM64 or x64)
3. Updates download button URL accordingly
4. Falls back to ARM64 if detection fails

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
rm -rf dist node_modules/.cache
npm install
npm run build:direct
```

### Upload Permission Error

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set project (if needed)
gcloud config set project YOUR_PROJECT_ID
```

### File Not Found After Upload

```bash
# Check bucket contents
gsutil ls -lh gs://flickfix-downloads/

# Verify permissions
gsutil iam get gs://flickfix-downloads
```

### Wrong Version in URLs

Make sure:
1. `package.json` has correct version (0.1.1)
2. Landing page JavaScript uses correct version
3. Files uploaded match version number

## Version Update Checklist

When releasing a new version:

- [ ] Update `package.json` version
- [ ] Build DMG files: `npm run build:direct`
- [ ] Upload to GCS: `gsutil cp dist/flickfix-X.X.X-*.dmg gs://flickfix-downloads/`
- [ ] Update landing page version in JavaScript
- [ ] Update hardcoded URLs in HTML (if any)
- [ ] Test download links
- [ ] Deploy landing page (if hosted separately)

## File Naming Convention

- ARM64: `flickfix-{version}-arm64.dmg`
- x64: `flickfix-{version}-x64.dmg`

Example:
- `flickfix-0.1.1-arm64.dmg`
- `flickfix-0.1.1-x64.dmg`

## Next Steps After Upload

1. **Test Downloads:**
   - Visit your landing page
   - Click download button
   - Verify correct file downloads

2. **Deploy Landing Page:**
   ```bash
   cd landing
   firebase deploy
   ```

3. **Monitor:**
   - Check download analytics (if set up)
   - Monitor for any user issues

## Quick Reference

```bash
# Build
npm run build:direct

# Upload
gsutil cp dist/flickfix-0.1.1-*.dmg gs://flickfix-downloads/
gsutil iam ch allUsers:objectViewer gs://flickfix-downloads

# Verify
gsutil ls gs://flickfix-downloads/
curl -I https://storage.googleapis.com/flickfix-downloads/flickfix-0.1.1-arm64.dmg
```

Done! Your DMG files are ready for download. 🚀




