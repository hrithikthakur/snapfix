# SnapFix Distribution Guide

This guide covers how to distribute SnapFix on the Apple App Store and via direct download from your website.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [App Store Distribution](#app-store-distribution)
3. [Direct Website Distribution](#direct-website-distribution)
4. [Code Signing Setup](#code-signing-setup)
5. [Notarization](#notarization)
6. [Building for Distribution](#building-for-distribution)
7. [Uploading to App Store](#uploading-to-app-store)
8. [Hosting Direct Downloads](#hosting-direct-downloads)
9. [Important Limitations](#important-limitations)

---

## Prerequisites

### Required Accounts & Tools

1. **Apple Developer Account** ($99/year)
   - Sign up at https://developer.apple.com
   - Required for both App Store and direct distribution

2. **Xcode** (latest version)
   - Install from Mac App Store
   - Includes command line tools

3. **App-Specific Password**
   - Create at https://appleid.apple.com
   - Account > Sign-In and Security > App-Specific Passwords
   - Required for notarization

### Environment Variables

Create a `.env.dist` file (or set in your shell):

```bash
# Apple Developer credentials
APPLE_ID=your@email.com
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=XXXXXXXXXX

# Code signing identity (optional, auto-detected)
# APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
```

---

## App Store Distribution

### ⚠️ Important Limitations

**Electron apps on the Mac App Store have significant limitations:**

1. **No Accessibility APIs**: The App Store sandbox prevents access to accessibility APIs
   - Your app **cannot** automatically replace text in other apps
   - Users must manually copy/paste text
   - The native text bridge will not work

2. **Sandbox Restrictions**: 
   - Limited file system access
   - No system-level integrations
   - Restricted network access

3. **User Experience Impact**:
   - App Store version will be clipboard-only
   - No automatic text replacement
   - Reduced functionality compared to direct distribution

### Building for App Store

1. **Update package.json** (already configured):
   ```json
   "mas": {
     "entitlements": "build/entitlements.mas.plist",
     "entitlementsInherit": "build/entitlements.mas.inherit.plist",
     "category": "public.app-category.productivity"
   }
   ```

2. **Build MAS package**:
   ```bash
   npm run build:mas
   ```

3. **Sign the app** (electron-builder handles this automatically):
   - Ensure your Developer ID certificate is installed in Keychain
   - The build process will sign with your App Store certificate

4. **Create app archive**:
   ```bash
   # The build creates a .pkg file in dist/
   # Upload this via Transporter or Xcode
   ```

### Uploading to App Store

1. **Install Transporter** (from Mac App Store)

2. **Export the app**:
   ```bash
   # electron-builder creates a .pkg file
   # Use Transporter to upload
   ```

3. **Or use Xcode**:
   - Open Xcode
   - Window > Organizer
   - Click "+" > "Distribute App"
   - Select "App Store Connect"
   - Follow the wizard

4. **Complete App Store Connect listing**:
   - Go to https://appstoreconnect.apple.com
   - Create new app listing
   - Fill in metadata, screenshots, description
   - Submit for review

---

## Direct Website Distribution

### Advantages

✅ **Full functionality**: Accessibility APIs work  
✅ **No sandbox restrictions**: Full system integration  
✅ **Automatic text replacement**: Native bridge works  
✅ **Better user experience**: All features available  

### Building for Direct Distribution

1. **Set up code signing**:
   ```bash
   # Ensure Developer ID certificate is installed
   security find-identity -v -p codesigning
   ```

2. **Build and notarize**:
   ```bash
   # Set environment variables
   export APPLE_ID="your@email.com"
   export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
   export APPLE_TEAM_ID="XXXXXXXXXX"
   
   # Build (notarization happens automatically)
   npm run build:direct
   ```

3. **Verify notarization**:
   ```bash
   spctl --assess --verbose --type install dist/SnapFix-0.1.0.dmg
   ```

### Hosting Downloads

1. **Upload DMG to hosting**:
   - Google Cloud Storage (current setup)
   - AWS S3
   - Your own server

2. **Update landing page**:
   - Update download links in `landing/index.html`
   - Add version information
   - Include checksums for verification

3. **Set up auto-updates** (optional):
   - Use electron-updater
   - Host update server
   - Configure update endpoints

---

## Code Signing Setup

### 1. Install Certificates

1. **Download from Apple Developer**:
   - Go to https://developer.apple.com/account/resources/certificates/list
   - Download certificates:
     - **Developer ID Application** (for direct distribution)
     - **Mac App Distribution** (for App Store)

2. **Install certificates**:
   ```bash
   # Double-click .cer files to install in Keychain
   # Or use security command:
   security import certificate.cer -k ~/Library/Keychains/login.keychain
   ```

### 2. Verify Installation

```bash
# List available signing identities
security find-identity -v -p codesigning

# You should see:
# "Developer ID Application: Your Name (TEAM_ID)"
# "Mac App Distribution: Your Name (TEAM_ID)"
```

### 3. Configure electron-builder

The configuration is already set in `package.json`. electron-builder will:
- Auto-detect your signing identity
- Sign all binaries and frameworks
- Create properly signed DMG/PKG files

---

## Notarization

### What is Notarization?

Notarization is Apple's security process for apps distributed outside the App Store. It's **required** for macOS 10.15+.

### Automatic Notarization

The `scripts/notarize.js` script handles notarization automatically during build.

**Requirements**:
- `APPLE_ID`: Your Apple ID email
- `APPLE_APP_SPECIFIC_PASSWORD`: App-specific password (not your regular password)
- `APPLE_TEAM_ID`: Your team ID (optional, auto-detected)

### Manual Notarization

If automatic notarization fails:

```bash
# 1. Create a zip file
cd dist/mac
zip -r SnapFix.zip SnapFix.app

# 2. Submit for notarization
xcrun notarytool submit SnapFix.zip \
  --apple-id "your@email.com" \
  --password "app-specific-password" \
  --team-id "TEAM_ID" \
  --wait

# 3. Staple the notarization ticket
xcrun stapler staple SnapFix.app

# 4. Create DMG with stapled app
```

### Troubleshooting Notarization

**Common errors**:

1. **"Invalid credentials"**:
   - Verify app-specific password is correct
   - Ensure 2FA is enabled on Apple ID

2. **"Team ID not found"**:
   - Set `APPLE_TEAM_ID` environment variable
   - Or add to `package.json` notarize config

3. **"Hardened runtime violations"**:
   - Check entitlements file
   - Ensure all required entitlements are present

---

## Building for Distribution

### Build Scripts

```bash
# Development build (unsigned)
npm run build:mac

# App Store build
npm run build:mas

# Direct distribution build (signed + notarized)
npm run build:direct

# Build directory only (for testing)
npm run build:dir
```

### Build Outputs

- **App Store**: `dist/mac/SnapFix-0.1.0.pkg`
- **Direct**: `dist/SnapFix-0.1.0.dmg` and `dist/SnapFix-0.1.0-arm64.dmg`

---

## Uploading to App Store

### Using Transporter (Recommended)

1. **Download Transporter** from Mac App Store

2. **Export from electron-builder**:
   ```bash
   npm run build:mas
   ```

3. **Upload via Transporter**:
   - Open Transporter
   - Drag `.pkg` file into Transporter
   - Click "Deliver"
   - Wait for upload to complete

### Using Xcode

1. **Archive the app**:
   ```bash
   # Build first
   npm run build:mas
   
   # Then archive (if needed)
   # Open Xcode > Window > Organizer
   ```

2. **Distribute**:
   - Select archive
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow wizard

### App Store Connect

1. **Create app listing**:
   - Go to https://appstoreconnect.apple.com
   - My Apps > "+" > New App
   - Fill in:
     - Name: SnapFix
     - Primary Language: English
     - Bundle ID: com.snapfix.app
     - SKU: snapfix-001

2. **Upload build**:
   - After uploading via Transporter, wait for processing
   - Build appears in "TestFlight" or "App Store" tab

3. **Complete listing**:
   - App Information
   - Pricing and Availability
   - App Privacy (important!)
   - Screenshots and description
   - App Review Information

4. **Submit for review**:
   - Click "Submit for Review"
   - Answer export compliance questions
   - Wait for review (usually 1-3 days)

---

## Hosting Direct Downloads

### Current Setup (Google Cloud Storage)

Your landing page already points to:
```
https://storage.googleapis.com/snapfix-downloads/SnapFix-0.1.0.dmg
```

### Steps to Update

1. **Build new version**:
   ```bash
   npm run build:direct
   ```

2. **Upload to GCS**:
   ```bash
   # Install gsutil if needed
   # brew install gcloud
   
   gsutil cp dist/SnapFix-0.1.0.dmg gs://snapfix-downloads/
   gsutil cp dist/SnapFix-0.1.0-arm64.dmg gs://snapfix-downloads/
   ```

3. **Update landing page**:
   - Update version numbers in `landing/index.html`
   - Update download links
   - Add release notes

4. **Set proper permissions**:
   ```bash
   gsutil iam ch allUsers:objectViewer gs://snapfix-downloads
   ```

### Alternative Hosting Options

- **AWS S3**: Similar to GCS, use CloudFront for CDN
- **GitHub Releases**: Free, good for open source
- **Your own server**: Full control, requires HTTPS

---

## Important Limitations

### App Store Version

❌ **Cannot use accessibility APIs**  
❌ **No automatic text replacement**  
❌ **Clipboard-only workflow**  
❌ **Reduced functionality**  

### Direct Distribution Version

✅ **Full accessibility API access**  
✅ **Automatic text replacement**  
✅ **Native bridge works**  
✅ **Complete functionality**  

### Recommendation

**Offer both options**:
- **App Store**: For users who prefer App Store convenience
- **Direct Download**: For users who need full functionality

Make it clear on your website which version has which features.

---

## Troubleshooting

### Code Signing Issues

```bash
# Check certificate validity
security find-identity -v -p codesigning

# Verify app signature
codesign --verify --verbose --deep SnapFix.app

# Check entitlements
codesign --display --entitlements - SnapFix.app
```

### Notarization Issues

```bash
# Check notarization status
xcrun notarytool history \
  --apple-id "your@email.com" \
  --password "app-specific-password" \
  --team-id "TEAM_ID"

# Get notarization log
xcrun notarytool log <submission-id> \
  --apple-id "your@email.com" \
  --password "app-specific-password" \
  --team-id "TEAM_ID"
```

### Build Issues

```bash
# Clean build
rm -rf dist node_modules/.cache
npm run build:direct

# Check electron-builder logs
# Logs are in ~/Library/Logs/electron-builder/
```

---

## Next Steps

1. ✅ Set up Apple Developer account
2. ✅ Install certificates
3. ✅ Configure environment variables
4. ✅ Test build locally
5. ✅ Build for App Store
6. ✅ Build for direct distribution
7. ✅ Upload to App Store Connect
8. ✅ Update website with download links
9. ✅ Submit for App Store review

---

## Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation)
- [electron-builder Documentation](https://www.electron.build/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Notarization Guide](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)

