# Notarize Existing Builds

If you have existing builds that weren't notarized, you can notarize them manually using this guide.

## Quick Start

1. **Set your credentials** (if not already set):
   ```bash
   export APPLE_ID="your@email.com"
   export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
   export APPLE_TEAM_ID="68G57WN635"  # Optional, defaults to this
   ```

2. **Run the notarization script**:
   ```bash
   # Notarize both arm64 and x64 builds
   ./scripts/notarize-existing.sh
   
   # Or notarize specific architecture
   ./scripts/notarize-existing.sh arm64
   ./scripts/notarize-existing.sh x64
   ```

The script will:
- Check if credentials are set
- Create zip files for the apps
- Submit to Apple for notarization (takes 5-30 minutes)
- Staple the notarization tickets
- Verify the results

## Manual Notarization

If you prefer to do it manually:

### Step 1: Notarize the App

```bash
cd dist/mac-arm64  # or dist/mac for x64

# Create zip
zip -r FlickFix.zip "FlickFix.app"

# Submit for notarization
xcrun notarytool submit FlickFix.zip \
  --apple-id "$APPLE_ID" \
  --password "$APPLE_APP_SPECIFIC_PASSWORD" \
  --team-id "$APPLE_TEAM_ID" \
  --wait

# Staple the ticket
xcrun stapler staple "FlickFix.app"

# Verify
xcrun stapler validate "FlickFix.app"

# Clean up
rm FlickFix.zip
```

### Step 2: Notarize the DMG

```bash
cd dist

# Submit DMG for notarization
xcrun notarytool submit FlickFix-0.1.1-arm64.dmg \
  --apple-id "$APPLE_ID" \
  --password "$APPLE_APP_SPECIFIC_PASSWORD" \
  --team-id "$APPLE_TEAM_ID" \
  --wait

# Staple the ticket
xcrun stapler staple FlickFix-0.1.1-arm64.dmg

# Verify
spctl --assess --verbose --type install FlickFix-0.1.1-arm64.dmg
```

## Verify Notarization

After notarization, verify it worked:

```bash
# Check the app
xcrun stapler validate "dist/mac-arm64/FlickFix.app"

# Check the DMG
spctl --assess --verbose --type install dist/FlickFix-0.1.1-arm64.dmg
```

You should see `accepted` or `source=Notarized Developer ID`.

## Troubleshooting

### "Invalid credentials"
- Double-check your app-specific password
- Make sure 2FA is enabled on your Apple ID
- Regenerate the app-specific password if needed

### "Team ID not found"
- Set `APPLE_TEAM_ID` environment variable
- Or it will default to `68G57WN635` (from package.json)

### Notarization takes too long
- Normal wait time is 5-30 minutes
- Check status: `xcrun notarytool history --apple-id "$APPLE_ID" --password "$APPLE_APP_SPECIFIC_PASSWORD"`

### Already notarized
- The script will skip if already notarized
- You can force re-notarization by removing the staple first:
  ```bash
  xcrun stapler remove "FlickFix.app"
  ```

