# Setting Up Build Credentials

To build with automatic notarization, you need to set up your Apple Developer credentials.

## Quick Setup

### Step 1: Create `.env` file

Create a `.env` file in the project root with your credentials:

```bash
# In the project root directory
cat > .env << EOF
APPLE_ID=hrithikthakur17@gmail.com
APPLE_APP_SPECIFIC_PASSWORD=nhqi-axvq-ljxt-woym
APPLE_TEAM_ID=68G57WN635
EOF
```

Or manually create `.env` with:
```
APPLE_ID=hrithikthakur17@gmail.com
APPLE_APP_SPECIFIC_PASSWORD=nhqi-axvq-ljxt-woym
APPLE_TEAM_ID=68G57WN635
```

**Note:** The `.env` file is already in `.gitignore`, so it won't be committed to git.

### Step 2: Build with Notarization

Now you can build with automatic notarization:

```bash
# Option 1: Use the build script (recommended)
./scripts/build-with-notarization.sh

# Option 2: Use npm script
npm run build:notarized

# Option 3: Manually source .env and build
source .env
npm run build:direct
```

## Alternative: Export Variables in Shell

If you prefer not to use a `.env` file, export the variables in your shell:

```bash
export APPLE_ID="hrithikthakur17@gmail.com"
export APPLE_APP_SPECIFIC_PASSWORD="nhqi-axvq-ljxt-woym"
export APPLE_TEAM_ID="68G57WN635"

# Then build
npm run build:direct
```

To make these persistent, add them to your `~/.zshrc` or `~/.bash_profile`:

```bash
echo 'export APPLE_ID="hrithikthakur17@gmail.com"' >> ~/.zshrc
echo 'export APPLE_APP_SPECIFIC_PASSWORD="nhqi-axvq-ljxt-woym"' >> ~/.zshrc
echo 'export APPLE_TEAM_ID="68G57WN635"' >> ~/.zshrc
source ~/.zshrc
```

## Verify Setup

Check that credentials are loaded:

```bash
# Source .env if using that method
source .env

# Check variables
echo "APPLE_ID: ${APPLE_ID:+SET}"
echo "APPLE_APP_SPECIFIC_PASSWORD: ${APPLE_APP_SPECIFIC_PASSWORD:+SET}"
echo "APPLE_TEAM_ID: ${APPLE_TEAM_ID}"
```

## Build Options

### Build Both Architectures (Default)
```bash
./scripts/build-with-notarization.sh
# or
npm run build:notarized
```

### Build Specific Architecture
```bash
# Apple Silicon (arm64)
./scripts/build-with-notarization.sh arm64

# Intel (x64)
./scripts/build-with-notarization.sh x64
```

## What Happens During Build

1. **Code Signing**: App is signed with your Developer ID certificate
2. **Notarization**: App is submitted to Apple for notarization (5-30 minutes)
3. **Stapling**: Notarization ticket is stapled to the app
4. **DMG Creation**: Signed and notarized DMG files are created

## Troubleshooting

### "Skipping notarization" message
- Make sure `.env` file exists and has correct credentials
- Or export variables before building
- Check for typos in variable names

### "Invalid credentials" error
- Verify app-specific password is correct
- Make sure 2FA is enabled on your Apple ID
- Regenerate app-specific password if needed

### Build works but app still blocked by Gatekeeper
- The build might have skipped notarization
- Check build output for notarization messages
- Manually notarize using: `./scripts/notarize-existing.sh`

## Security Note

⚠️ **Never commit `.env` file to git!** It's already in `.gitignore`, but double-check before committing.

If you need to share credentials with team members, use a secure password manager or secrets management tool.

