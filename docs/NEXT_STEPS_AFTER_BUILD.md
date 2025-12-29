# Next Steps After Successful Build

Your app has been successfully built, code signed, and notarized! Here's what to do next.

## ✅ What Just Happened

1. ✅ App was packaged
2. ✅ Code signed with Developer ID certificate
3. ✅ Notarized by Apple
4. ✅ DMG file created

## Step 1: Verify the Build

Once the build completes, check that the files were created:

```bash
# List the built files
ls -lh dist/*.dmg

# You should see:
# - dist/flickfix-0.1.0-arm64.dmg (or similar)
```

## Step 2: Test the DMG Locally

### Open and Install:

```bash
# Open the DMG
open dist/flickfix-0.1.0-arm64.dmg

# Or double-click it in Finder
```

### Verify Notarization:

```bash
# Check that notarization worked
spctl --assess --verbose --type install dist/flickfix-0.1.0-arm64.dmg

# Should output: "accepted" or "source=Notarized Developer ID"
```

### Test the App:

1. Drag flickfix.app to Applications folder
2. Open flickfix from Applications
3. Grant accessibility permissions if prompted
4. Test the functionality

## Step 3: Upload to Hosting

### Option A: Google Cloud Storage (Current Setup)

```bash
# Install gsutil if needed
# brew install gcloud

# Upload the DMG
gsutil cp dist/flickfix-0.1.0-arm64.dmg gs://flickfix-downloads/

# Set public read access
gsutil iam ch allUsers:objectViewer gs://flickfix-downloads
```

### Option B: AWS S3

```bash
aws s3 cp dist/flickfix-0.1.0-arm64.dmg s3://your-bucket/flickfix/
aws s3api put-object-acl --bucket your-bucket --key flickfix/flickfix-0.1.0-arm64.dmg --acl public-read
```

### Option C: Your Own Server

Upload via FTP/SFTP to your web server, ensuring HTTPS is enabled.

## Step 4: Update Landing Page

Update `landing/index.html` with the new download link:

```html
<!-- Update the download links -->
<a href="https://storage.googleapis.com/flickfix-downloads/flickfix-0.1.0-arm64.dmg" 
   class="btn-primary download-btn" 
   download>Download for macOS</a>
```

**Update version number** if this is a new release.

## Step 5: Test the Download

1. Visit your landing page
2. Click the download link
3. Verify the DMG downloads correctly
4. Test installation on a clean Mac (if possible)

## Step 6: Deploy Landing Page

If your landing page is hosted separately:

```bash
# If using Firebase Hosting
cd landing
firebase deploy

# Or deploy via your hosting method
```

## Optional: Create Release Notes

Create a `CHANGELOG.md` or update release notes:

```markdown
## Version 0.1.0

- Initial release
- System-wide grammar fixing
- Global keyboard shortcut support
- Automatic text replacement
```

## Optional: Set Up Auto-Updates

For future releases, consider setting up auto-updates:

1. Use `electron-updater` package
2. Host update server
3. Configure update endpoints in your app

## Troubleshooting

### DMG Won't Open

- Check Gatekeeper: `spctl --assess --verbose dist/flickfix-0.1.0-arm64.dmg`
- If blocked, right-click → Open (first time only)

### Download Link Doesn't Work

- Verify file is uploaded
- Check file permissions (should be public read)
- Verify URL is correct

### App Doesn't Work After Installation

- Check accessibility permissions
- Verify API key is configured
- Check console for errors

## What's Next?

1. **Monitor downloads** - Track how many people download
2. **Gather feedback** - Get user feedback
3. **Plan updates** - Fix bugs, add features
4. **Consider App Store** - Build MAS version if desired

## Building for App Store

If you want to also distribute via App Store:

```bash
npm run build:mas
```

**Note:** App Store version has limitations (no accessibility APIs).

---

Congratulations! Your app is ready for distribution! 🎉

