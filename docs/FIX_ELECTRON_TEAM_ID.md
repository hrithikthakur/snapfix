# Fix "Could not automatically determine ElectronTeamID"

## Problem
electron-builder can't extract Team ID from the certificate for MAS builds.

## Solution: Set APPLE_TEAM_ID Environment Variable

The Team ID needs to be set as an environment variable. I've updated the build script, but you can also set it manually:

### Method 1: Export Before Building

```bash
export APPLE_TEAM_ID="68G57WN635"
npm run build:mas
```

### Method 2: Use .env File

If you have a `.env` file:

```bash
source .env
npm run build:mas
```

### Method 3: Inline (Already Done)

The build script now includes:
```json
"build:mas": "APPLE_TEAM_ID=68G57WN635 electron-builder --mac --config.mac.target=mas"
```

## Verify Certificate

Make sure your certificate is properly installed:

```bash
security find-identity -v -p codesigning | grep -i "mac app distribution"
```

You should see:
```
"3rd Party Mac Developer Application: Your Name (TEAM_ID)"
```

## If Still Failing

1. **Check certificate is valid:**
   ```bash
   security find-certificate -c "3rd Party Mac Developer Application" -p
   ```

2. **Try reinstalling certificate via Xcode:**
   - Xcode → Settings → Accounts
   - Select your Apple ID
   - Manage Certificates → + → Mac App Distribution

3. **Verify Team ID matches:**
   - Your Team ID: `68G57WN635`
   - Should match the certificate's Team ID

## Alternative: Use preAutoEntitlements Hook

If environment variable doesn't work, we can create a custom hook to set the Team ID in entitlements.

