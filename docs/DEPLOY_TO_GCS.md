# Deploy Version to Google Cloud Storage

This guide walks you through deploying a new version of FlickFix to Google Cloud Storage and updating the landing page.

## Prerequisites

1. **DMG files built** in `dist/` folder:
   - `FlickFix-0.1.1-arm64.dmg` (Apple Silicon)
   - `FlickFix-0.1.1-x64.dmg` (Intel Macs)

2. **Google Cloud SDK installed**:
   ```bash
   # Check if installed
   which gsutil
   
   # If not installed, install via:
   # https://cloud.google.com/sdk/docs/install
   ```

3. **Authenticated with Google Cloud**:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

## Quick Deployment

### Step 1: Authenticate (if needed)

```bash
gcloud auth login
```

### Step 2: Upload DMG Files

Run the deployment script:

```bash
./scripts/deploy-version.sh 0.1.1
```

This will:
- ✅ Check that DMG files exist
- ✅ Upload both ARM64 and x64 versions to GCS
- ✅ Make files publicly accessible
- ✅ Verify uploads
- ✅ Check landing page configuration

### Step 3: Verify Uploads

The script will output download URLs. Test them:

```bash
# ARM64 version
curl -I https://storage.googleapis.com/flickfix-downloads/FlickFix-0.1.1-arm64.dmg

# x64 version
curl -I https://storage.googleapis.com/flickfix-downloads/FlickFix-0.1.1-x64.dmg
```

Both should return `200 OK`.

## Manual Upload (Alternative)

If the script doesn't work, upload manually:

```bash
VERSION="0.1.1"
BUCKET="gs://flickfix-downloads"

# Upload files
gsutil cp dist/FlickFix-${VERSION}-arm64.dmg ${BUCKET}/
gsutil cp dist/FlickFix-${VERSION}-x64.dmg ${BUCKET}/

# Make publicly accessible
gsutil iam ch allUsers:objectViewer ${BUCKET}
```

## Landing Page Configuration

The landing page (`landing/index.html`) automatically detects architecture and uses the correct download URL. It's already configured for v0.1.1:

- Base URL: `https://storage.googleapis.com/flickfix-downloads/FlickFix-0.1.1`
- Auto-detects: ARM64 or x64
- Fallback: Defaults to ARM64

### Update Landing Page for New Version

If deploying a new version, update the version number in `landing/index.html`:

1. **Find the base URL** (around line 445):
   ```javascript
   const baseUrl = 'https://storage.googleapis.com/flickfix-downloads/FlickFix-0.1.1';
   ```

2. **Update to new version**:
   ```javascript
   const baseUrl = 'https://storage.googleapis.com/flickfix-downloads/FlickFix-0.1.2';
   ```

3. **Update hardcoded links** (around lines 304 and 338):
   ```html
   <a href="https://storage.googleapis.com/flickfix-downloads/FlickFix-0.1.2-arm64.dmg" ...>
   ```

## Deploy Landing Page

After uploading DMG files, deploy the landing page:

```bash
cd landing
firebase deploy
```

Or if using a different hosting service, deploy accordingly.

## Verify Complete Deployment

1. ✅ DMG files uploaded to GCS
2. ✅ Files are publicly accessible
3. ✅ Landing page updated (if new version)
4. ✅ Landing page deployed
5. ✅ Download links work on live site

## Troubleshooting

### "Cannot access bucket"
- Run `gcloud auth login`
- Verify project: `gcloud config get-value project`
- Check bucket exists: `gsutil ls gs://flickfix-downloads`

### "Permission denied"
- Make sure bucket has public read access:
  ```bash
  gsutil iam ch allUsers:objectViewer gs://flickfix-downloads
  ```

### Files not accessible after upload
- Wait a few seconds for propagation
- Check bucket permissions
- Verify file names match exactly

### Landing page shows wrong version
- Check JavaScript in `landing/index.html`
- Clear browser cache
- Verify Firebase deployment completed

## Current Version URLs

**Version 0.1.1:**
- ARM64: https://storage.googleapis.com/flickfix-downloads/FlickFix-0.1.1-arm64.dmg
- x64: https://storage.googleapis.com/flickfix-downloads/FlickFix-0.1.1-x64.dmg

