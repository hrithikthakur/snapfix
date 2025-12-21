# Testing Your Build Setup

Now that you have all your credentials set up, let's test the build process.

## Quick Test: Build for Direct Distribution

This will create a signed and notarized DMG file:

```bash
# Make sure you're in the project directory
cd /Users/hrithikthakur/Code/snapfix

# Source your .env file to load credentials
source .env

# Build for direct distribution (signed + notarized)
npm run build:direct
```

## What to Expect

### During Build:
1. **electron-builder** will package your app
2. **Code signing** will happen automatically
3. **Notarization** will submit your app to Apple
4. You'll see progress messages

### Build Output:
- `dist/SnapFix-0.1.0.dmg` - Main DMG file
- `dist/SnapFix-0.1.0-arm64.dmg` - ARM64 version (if building universal)
- `dist/mac/SnapFix.app` - The actual app bundle

### Notarization Process:
- Takes 5-15 minutes typically
- You'll see: "📦 Notarizing SnapFix..."
- Then: "✅ Notarization successful!" (if successful)

## Troubleshooting

### Build Fails with "Code signing failed"
**Solution:**
- Verify certificates are installed: `security find-identity -v -p codesigning`
- Make sure "Developer ID Application" certificate is present

### Notarization Fails
**Common errors:**

1. **"Invalid credentials"**
   - Check APPLE_ID is correct
   - Verify app-specific password is correct (no extra spaces)
   - Ensure 2FA is enabled

2. **"Team ID not found"**
   - Verify APPLE_TEAM_ID matches your certificate
   - Check it's set in environment variables

3. **"Hardened runtime violations"**
   - Check entitlements file
   - May need to adjust entitlements

### Build Succeeds but Notarization Skips
**If you see:** "⚠️ Skipping notarization: APPLE_ID and APPLE_APP_SPECIFIC_PASSWORD not set"

**Solution:**
- Make sure you've sourced your .env file: `source .env`
- Or export variables directly in your shell
- Check .env file has correct variable names

## Testing the Built App

After successful build:

1. **Open the DMG:**
   ```bash
   open dist/SnapFix-0.1.0.dmg
   ```

2. **Install the app:**
   - Drag SnapFix.app to Applications folder

3. **Verify notarization:**
   ```bash
   spctl --assess --verbose --type install dist/SnapFix-0.1.0.dmg
   ```
   Should say: "accepted" or "source=Notarized Developer ID"

4. **Test the app:**
   - Open SnapFix from Applications
   - Grant accessibility permissions if prompted
   - Test the functionality

## Next Steps After Successful Build

1. **Upload DMG to hosting:**
   - Google Cloud Storage (current setup)
   - Or your own hosting

2. **Update landing page:**
   - Update download links in `landing/index.html`
   - Update version number

3. **Test download:**
   - Download from your website
   - Verify it installs correctly
   - Check Gatekeeper accepts it

## Building for App Store

If you want to test App Store build:

```bash
npm run build:mas
```

**Note:** You'll need a "Mac App Distribution" certificate for this, not just "Developer ID Application".

## Quick Commands Reference

```bash
# Load credentials
source .env

# Build for direct distribution
npm run build:direct

# Build for App Store
npm run build:mas

# Build unsigned (for testing)
npm run build:mac

# Check certificates
security find-identity -v -p codesigning

# Verify notarization
spctl --assess --verbose --type install dist/SnapFix-0.1.0.dmg
```

