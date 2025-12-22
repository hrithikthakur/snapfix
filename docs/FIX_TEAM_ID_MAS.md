# Fix Team ID for MAS Builds

## Problem
electron-builder can't automatically determine Team ID from certificate.

## Solution: Set Team ID via Environment Variable

electron-builder will use the Team ID from the certificate automatically, but if it can't detect it, set it via environment variable:

```bash
export APPLE_TEAM_ID="68G57WN635"
npm run build:mas
```

Or set it in your `.env` file and source it:

```bash
source .env
npm run build:mas
```

## Alternative: Use preAutoEntitlements

If the certificate is properly installed, electron-builder should detect the Team ID automatically. The issue might be that the certificate isn't fully installed or linked with the private key.

## Verify Certificate

```bash
# Check if Mac App Distribution certificate is installed
security find-identity -v -p codesigning | grep -i "mac app distribution"
```

You should see:
```
"3rd Party Mac Developer Application: Your Name (TEAM_ID)"
```

If you don't see it, install via Xcode:
1. Xcode → Settings → Accounts
2. Select your Apple ID
3. Manage Certificates → + → Mac App Distribution

