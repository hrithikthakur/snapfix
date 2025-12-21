# SnapFix Distribution Setup - Complete Guide

## 🎯 What's Been Set Up

Your SnapFix app is now configured for **both** Apple App Store and direct website distribution. Here's what's ready:

### ✅ Completed Setup

1. **App Store (MAS) Configuration**
   - Entitlements files created (`build/entitlements.mas.plist`)
   - Build script: `npm run build:mas`
   - Sandbox-compliant configuration

2. **Direct Distribution Configuration**
   - Notarization script (`scripts/notarize.js`)
   - Build script: `npm run build:direct`
   - Hardened runtime enabled
   - Proper entitlements for accessibility APIs

3. **Documentation**
   - Comprehensive distribution guide
   - Quick start guide
   - App Store checklist
   - Comparison summary

4. **Landing Page Updates**
   - Updated with distribution info
   - Ready for App Store badge (when available)

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

This will install `@electron/notarize` which is needed for notarization.

### Step 2: Set Up Apple Developer Credentials

```bash
# Create a .env.dist file or export these:
export APPLE_ID="your@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="XXXXXXXXXX"
```

**Get your credentials:**
- Apple ID: Your Apple Developer account email
- App-specific password: Create at https://appleid.apple.com → App-Specific Passwords
- Team ID: Find at https://developer.apple.com/account → Membership

### Step 3: Install Certificates

1. Go to https://developer.apple.com/account/resources/certificates/list
2. Download:
   - **Developer ID Application** (for direct downloads)
   - **Mac App Distribution** (for App Store)
3. Double-click to install in Keychain

### Step 4: Build

**For App Store:**
```bash
npm run build:mas
# Output: dist/mac/SnapFix-0.1.0.pkg
```

**For Direct Download:**
```bash
npm run build:direct
# Output: dist/SnapFix-0.1.0.dmg (notarized)
```

---

## 📋 Distribution Options

### Option 1: Direct Download (Recommended)

**Advantages:**
- ✅ Full functionality (accessibility APIs work)
- ✅ Automatic text replacement
- ✅ Better user experience

**Steps:**
1. Build: `npm run build:direct`
2. Upload DMG to your hosting (e.g., Google Cloud Storage)
3. Update download links in `landing/index.html`
4. Deploy landing page

**Current setup:** Already configured for Google Cloud Storage

### Option 2: Mac App Store

**Limitations:**
- ⚠️ No accessibility APIs (sandbox restriction)
- ⚠️ Clipboard-only workflow
- ⚠️ Reduced functionality

**Steps:**
1. Build: `npm run build:mas`
2. Upload via Transporter app
3. Complete App Store Connect listing
4. Submit for review

---

## 📚 Documentation

All documentation is in the `docs/` folder:

- **[DISTRIBUTION_GUIDE.md](docs/DISTRIBUTION_GUIDE.md)** - Complete guide with all details
- **[QUICK_START.md](docs/QUICK_START.md)** - Quick reference
- **[APP_STORE_CHECKLIST.md](docs/APP_STORE_CHECKLIST.md)** - Submission checklist
- **[DISTRIBUTION_SUMMARY.md](docs/DISTRIBUTION_SUMMARY.md)** - Comparison of options

---

## ⚠️ Important Notes

### App Store Limitations

The Mac App Store version **cannot** use accessibility APIs due to sandbox restrictions. This means:
- ❌ No automatic text replacement
- ❌ Users must manually copy/paste text
- ❌ Native bridge won't work

**Recommendation:** Offer both versions and clearly explain the difference.

### Code Signing

- electron-builder will auto-detect your signing certificates
- Make sure certificates are installed in Keychain
- Verify with: `security find-identity -v -p codesigning`

### Notarization

- Required for macOS 10.15+ direct distribution
- Handled automatically by the build script
- Requires Apple ID and app-specific password

---

## 🔧 Troubleshooting

### Build Fails

```bash
# Clean and rebuild
rm -rf dist node_modules/.cache
npm install
npm run build:direct
```

### Notarization Fails

- Check environment variables are set correctly
- Verify app-specific password is valid
- Ensure 2FA is enabled on Apple ID
- Check notarization logs in App Store Connect

### Code Signing Fails

```bash
# Check certificates
security find-identity -v -p codesigning

# Verify app signature
codesign --verify --verbose --deep dist/mac/SnapFix.app
```

---

## 📝 Next Steps

1. **Set up credentials** (Apple Developer account, certificates)
2. **Test build locally** (`npm run build:direct`)
3. **Choose distribution method** (or both!)
4. **Follow the appropriate guide**:
   - Direct download: Upload DMG and update links
   - App Store: Upload via Transporter and complete listing

---

## 🆘 Need Help?

- See [DISTRIBUTION_GUIDE.md](docs/DISTRIBUTION_GUIDE.md) for detailed instructions
- Check [APP_STORE_CHECKLIST.md](docs/APP_STORE_CHECKLIST.md) for submission steps
- Review [QUICK_START.md](docs/QUICK_START.md) for quick reference

---

## 📦 Build Scripts Reference

```bash
# Development
npm start                    # Run app locally

# Building
npm run build:mac            # Build for macOS (unsigned)
npm run build:mas            # Build for App Store
npm run build:direct         # Build for direct download (signed + notarized)
npm run build:dir            # Build directory only (for testing)

# Native modules
npm run build:native         # Build native macOS module
npm run rebuild              # Rebuild for Electron
```

---

Good luck with your distribution! 🚀

