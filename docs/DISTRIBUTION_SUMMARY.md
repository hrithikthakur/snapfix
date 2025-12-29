# Distribution Summary: App Store vs Direct Download

## Overview

flickfix can be distributed in two ways:

1. **Mac App Store** - Sandboxed, limited functionality
2. **Direct Download** - Full functionality, notarized DMG

## Comparison

| Feature | App Store | Direct Download |
|---------|-----------|-----------------|
| **Automatic Text Replacement** | ❌ No (sandbox restriction) | ✅ Yes (full accessibility) |
| **Clipboard Method** | ✅ Yes | ✅ Yes |
| **Native Bridge** | ❌ No | ✅ Yes |
| **User Experience** | ⚠️ Reduced | ✅ Full |
| **Distribution** | Via App Store | Via website |
| **Updates** | Automatic via App Store | Manual or auto-updater |
| **Notarization** | Handled by Apple | You handle |
| **Code Signing** | App Store certificate | Developer ID certificate |

## Recommendation

**Offer both options:**

1. **Direct Download** (primary):
   - Full functionality
   - Better user experience
   - Recommended for most users

2. **App Store** (secondary):
   - For users who prefer App Store convenience
   - Automatic updates via App Store
   - Clear about limitations

## Implementation Status

✅ **Direct Download**: Ready
- Build script: `npm run build:direct`
- Notarization: Automatic
- Hosting: Google Cloud Storage

⏳ **App Store**: Configuration ready, needs submission
- Build script: `npm run build:mas`
- Entitlements: Configured
- Upload: Via Transporter

## Next Steps

1. **For Direct Download**:
   - Build: `npm run build:direct`
   - Upload DMG to hosting
   - Update landing page links

2. **For App Store**:
   - Build: `npm run build:mas`
   - Upload via Transporter
   - Complete App Store Connect listing
   - Submit for review

See [DISTRIBUTION_GUIDE.md](./DISTRIBUTION_GUIDE.md) for detailed instructions.

