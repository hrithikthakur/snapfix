# Upload DMG Files with Architecture Pattern

## Desired URL Pattern

You want URLs like:
- `https://storage.googleapis.com/snapfix-downloads/SnapFix-0.1.0-arm64.dmg`
- `https://storage.googleapis.com/snapfix-downloads/SnapFix-0.1.0-x64.dmg`

## Current Files

- `dist/SnapFix-0.1.0-arm64.dmg` ✓ (already has arch)
- `dist/SnapFix-0.1.0.dmg` ✗ (needs to be renamed to `-x64`)

## Solution: Rename and Upload

### Option 1: Rename Intel Version

```bash
# Rename Intel version to include arch
mv dist/SnapFix-0.1.0.dmg dist/SnapFix-0.1.0-x64.dmg

# Upload both with consistent naming
gsutil cp dist/SnapFix-0.1.0-arm64.dmg gs://snapfix-downloads/
gsutil cp dist/SnapFix-0.1.0-x64.dmg gs://snapfix-downloads/

# Make public
gsutil iam ch allUsers:objectViewer gs://snapfix-downloads
```

### Option 2: Configure electron-builder (Future Builds)

I've updated `package.json` to use `artifactName` pattern, so future builds will automatically name files with architecture:

```json
"artifactName": "${productName}-${version}-${arch}.${ext}"
```

This will create:
- `SnapFix-0.1.0-arm64.dmg`
- `SnapFix-0.1.0-x64.dmg`

## Upload Commands

```bash
# Rename Intel version
mv dist/SnapFix-0.1.0.dmg dist/SnapFix-0.1.0-x64.dmg

# Upload both
gsutil cp dist/SnapFix-0.1.0-*.dmg gs://snapfix-downloads/

# Make public
gsutil iam ch allUsers:objectViewer gs://snapfix-downloads
```

## Final URLs

After upload, your URLs will be:
- ✅ `https://storage.googleapis.com/snapfix-downloads/SnapFix-0.1.0-arm64.dmg`
- ✅ `https://storage.googleapis.com/snapfix-downloads/SnapFix-0.1.0-x64.dmg`

Both follow the `{arch}` pattern you want!

