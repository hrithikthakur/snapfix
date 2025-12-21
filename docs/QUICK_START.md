# Quick Start: Distributing SnapFix

This is a quick reference guide. For detailed information, see [DISTRIBUTION_GUIDE.md](./DISTRIBUTION_GUIDE.md).

## Prerequisites Checklist

- [ ] Apple Developer account ($99/year)
- [ ] Xcode installed
- [ ] App-specific password created
- [ ] Certificates installed in Keychain

## Step 1: Set Up Credentials

```bash
# Create .env.dist file or export in your shell
export APPLE_ID="your@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="XXXXXXXXXX"
```

## Step 2: Install Certificates

1. Download from https://developer.apple.com/account/resources/certificates/list
2. Install:
   - **Developer ID Application** (for direct downloads)
   - **Mac App Distribution** (for App Store)

## Step 3: Build

### For App Store:
```bash
npm run build:mas
# Output: dist/mac/SnapFix-0.1.0.pkg
```

### For Direct Download:
```bash
npm run build:direct
# Output: dist/SnapFix-0.1.0.dmg (notarized)
```

## Step 4: Distribute

### App Store:
1. Open **Transporter** app
2. Drag `.pkg` file into Transporter
3. Click "Deliver"
4. Complete listing in App Store Connect

### Direct Download:
1. Upload DMG to your hosting (e.g., Google Cloud Storage)
2. Update download links in `landing/index.html`
3. Deploy landing page

## ⚠️ Important Notes

### App Store Limitations
- **No accessibility APIs** - App Store version cannot auto-replace text
- Users must use clipboard method only
- Consider offering both versions

### Direct Download Advantages
- Full functionality
- Automatic text replacement works
- Better user experience

## Troubleshooting

**Build fails?**
```bash
# Clean and rebuild
rm -rf dist node_modules/.cache
npm install
npm run build:direct
```

**Notarization fails?**
- Check environment variables are set
- Verify app-specific password is correct
- Ensure 2FA is enabled on Apple ID

**Code signing fails?**
```bash
# Check certificates
security find-identity -v -p codesigning
```

## Next Steps

See [DISTRIBUTION_GUIDE.md](./DISTRIBUTION_GUIDE.md) for:
- Detailed setup instructions
- Troubleshooting guide
- App Store Connect configuration
- Hosting setup

