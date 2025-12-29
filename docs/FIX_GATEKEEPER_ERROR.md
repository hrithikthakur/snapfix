# Fix "FlickFix can't be opened because Apple cannot check it for malicious software"

## Problem

macOS Gatekeeper is blocking the app because it's not notarized. This happens when:
- The app wasn't notarized during build
- The app was downloaded from the internet and macOS can't verify it
- Environment variables for notarization weren't set during build

## Quick Fix (Temporary Workaround)

If you need to use the app immediately, you can bypass Gatekeeper temporarily:

### Option 1: Right-click to Open (Recommended)

1. **Right-click** on the "FlickFix.app" file
2. Select **"Open"** from the context menu
3. Click **"Open"** in the security dialog
4. The app will open and macOS will remember this exception

### Option 2: Remove Quarantine Attribute

```bash
# Navigate to where the app is located
cd /path/to/FlickFix.app/..

# Remove quarantine attribute
xattr -d com.apple.quarantine "FlickFix.app"

# Or if you have the DMG:
xattr -d com.apple.quarantine FlickFix-*.dmg
```

### Option 3: System Settings

1. Open **System Settings** → **Privacy & Security**
2. Scroll down to see the blocked app message
3. Click **"Open Anyway"** next to the FlickFix message

## Permanent Fix: Rebuild with Notarization

To properly fix this, rebuild the app with notarization enabled:

### Step 1: Set Up Notarization Credentials

You need an Apple Developer account and app-specific password:

1. **Get your Apple ID** (the email associated with your Apple Developer account)

2. **Create an App-Specific Password**:
   - Go to https://appleid.apple.com
   - Sign in with your Apple ID
   - Go to **Security** → **App-Specific Passwords**
   - Click **"Generate an app-specific password"**
   - Name it "FlickFix Notarization" or similar
   - Copy the password (format: `xxxx-xxxx-xxxx-xxxx`)

3. **Get your Team ID** (optional, can be auto-detected):
   ```bash
   # Your Team ID is: 68G57WN635 (already in package.json)
   ```

### Step 2: Set Environment Variables

```bash
export APPLE_ID="your@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="68G57WN635"  # Optional, already configured
```

**Note:** Add these to your `~/.zshrc` or `~/.bash_profile` to persist them:

```bash
echo 'export APPLE_ID="your@email.com"' >> ~/.zshrc
echo 'export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"' >> ~/.zshrc
echo 'export APPLE_TEAM_ID="68G57WN635"' >> ~/.zshrc
source ~/.zshrc
```

### Step 3: Verify Code Signing Certificate

Make sure you have a valid Developer ID certificate:

```bash
security find-identity -v -p codesigning
```

You should see:
```
"Developer ID Application: Your Name (68G57WN635)"
```

If not, see [CREATE_APP_STORE_CERTIFICATE.md](CREATE_APP_STORE_CERTIFICATE.md) for instructions.

### Step 4: Rebuild with Notarization

```bash
# Clean previous builds
rm -rf dist

# Build with notarization (will happen automatically)
npm run build:direct
```

The build process will:
1. Sign the app with your Developer ID certificate
2. Automatically notarize it via the `afterSign` hook
3. Create properly signed and notarized DMG files

### Step 5: Verify Notarization

After building, verify the app is notarized:

```bash
# Check the DMG
spctl --assess --verbose --type install dist/FlickFix-*.dmg

# Check the app inside the DMG
spctl --assess --verbose --type exec dist/mac*/"FlickFix.app"
```

You should see: `accepted` or `source=Notarized Developer ID`

### Step 6: Test the New Build

1. **Mount the new DMG** from `dist/`
2. **Copy the app** to Applications
3. **Try opening it** - it should open without any Gatekeeper warnings

## Manual Notarization (If Build Fails)

If automatic notarization fails during build, you can manually notarize:

```bash
# 1. Create a zip of the app
cd dist/mac-arm64  # or dist/mac
zip -r FlickFix.zip "FlickFix.app"

# 2. Submit for notarization
xcrun notarytool submit FlickFix.zip \
  --apple-id "$APPLE_ID" \
  --password "$APPLE_APP_SPECIFIC_PASSWORD" \
  --team-id "$APPLE_TEAM_ID" \
  --wait

# 3. Staple the notarization ticket to the app
xcrun stapler staple "FlickFix.app"

# 4. Verify stapling
xcrun stapler validate "FlickFix.app"

# 5. Recreate DMG with stapled app
# (You'll need to rebuild the DMG or manually create it)
```

## Troubleshooting

### "Invalid credentials" error
- Double-check your app-specific password
- Make sure 2FA is enabled on your Apple ID
- Regenerate the app-specific password if needed

### "Team ID not found" error
- Set `APPLE_TEAM_ID` environment variable
- Or verify it's correct in `package.json` (should be `68G57WN635`)

### "Hardened runtime violations" error
- Check `build/entitlements.mac.plist` has all required entitlements
- Some entitlements may need justification for App Store review

### Notarization takes too long
- Notarization can take 5-30 minutes
- Use `--wait` flag to wait for completion
- Check status: `xcrun notarytool history --apple-id "$APPLE_ID" --password "$APPLE_APP_SPECIFIC_PASSWORD"`

## Prevention

To prevent this issue in the future:

1. **Always set environment variables** before building:
   ```bash
   export APPLE_ID="your@email.com"
   export APPLE_APP_SPECIFIC_PASSWORD="your-password"
   ```

2. **Verify notarization** after each build:
   ```bash
   spctl --assess --verbose --type install dist/FlickFix-*.dmg
   ```

3. **Test the DMG** on a clean Mac before distributing

## Related Documentation

- [DISTRIBUTION_GUIDE.md](DISTRIBUTION_GUIDE.md) - Complete distribution guide
- [CREATE_APP_STORE_CERTIFICATE.md](CREATE_APP_STORE_CERTIFICATE.md) - Certificate setup
- [CREATE_APP_SPECIFIC_PASSWORD.md](CREATE_APP_SPECIFIC_PASSWORD.md) - App-specific password guide

