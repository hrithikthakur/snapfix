# .app vs .dmg - What's the Difference?

## .app File

**What it is:**
- The actual macOS application bundle
- A folder that macOS treats as a single file
- Contains all the app's code, resources, and frameworks
- Can be run directly by double-clicking

**Location:**
- Usually in `dist/mac/flickfix.app` or `dist/mac-arm64/flickfix.app`
- This is what gets installed in the Applications folder

**Usage:**
- Can be run directly from anywhere
- Users can drag it to Applications folder manually
- Not typically distributed directly (no installer experience)

## .dmg File

**What it is:**
- Disk image file (like a virtual USB drive)
- A container that holds the .app file
- Used for distribution and installation
- Provides a better user experience

**Contents:**
- Contains the .app file
- Often includes a shortcut to Applications folder
- May include a README or license file
- Provides an installer-like experience

**Usage:**
- Users download the .dmg
- Double-click to "mount" it (opens like a USB drive)
- Drag the .app to Applications folder
- Eject the .dmg when done

## Why Use DMG for Distribution?

### Advantages:
✅ **Professional installation experience**
✅ **Easy for users** - drag and drop
✅ **Can include instructions** (README, license)
✅ **Standard macOS distribution format**
✅ **Can be code signed and notarized**

### .app Direct Distribution:
❌ Users have to manually move it
❌ No installer experience
❌ Less professional
❌ Harder to include documentation

## File Structure

```
flickfix-0.1.0-arm64.dmg
└── flickfix.app          ← The actual application
    └── (all app files)
```

## For Your Project

**What you're building:**
- `dist/flickfix-0.1.0-arm64.dmg` - Distribution file (what users download)
- `dist/mac-arm64/flickfix.app` - The actual app (inside the DMG)

**Distribution:**
- Upload DMG files to hosting (Google Cloud Storage, etc.)
- Users download DMG → mount → drag .app to Applications
- The .app file is what actually runs

## Building Both

When you build:
```bash
npm run build:direct
```

You get:
- `dist/flickfix-0.1.0.dmg` - Contains flickfix.app (Intel)
- `dist/flickfix-0.1.0-arm64.dmg` - Contains flickfix.app (ARM64)
- `dist/mac/flickfix.app` - The actual app (Intel)
- `dist/mac-arm64/flickfix.app` - The actual app (ARM64)

## Summary

- **.app** = The actual application (what runs)
- **.dmg** = Distribution package (what you upload/share)
- Users download DMG → extract .app → install .app

For distribution, always use **DMG files**. The .app files are included inside them.

