# Installation Guide for GrammrFix

## Building the App for macOS

### Prerequisites

1. **Node.js and npm** - Already installed if you're running the app
2. **Xcode Command Line Tools** - For building native modules (optional)
   ```bash
   xcode-select --install
   ```

### Step 1: Install Dependencies

```bash
npm install
```

This will install all dependencies including `electron-builder` for packaging.

### Step 2: Build the App

#### Option A: Build DMG (Recommended for Distribution)

```bash
npm run build:mac
```

This will create a `.dmg` file in the `dist` folder that you can distribute and install.

#### Option B: Build App Bundle Only

```bash
npm run build:dir
```

This creates the `.app` bundle in `dist/mac/` without creating a DMG.

#### Option C: Build Everything

```bash
npm run dist
```

This builds the app for distribution (DMG + ZIP).

### Step 3: Install the App

#### From DMG:

1. Open the `.dmg` file from the `dist` folder
2. Drag `GrammrFix.app` to your Applications folder
3. Open Applications folder
4. Right-click `GrammrFix.app` and select "Open"
5. Click "Open" when macOS warns about the app being from an unidentified developer

#### From App Bundle:

1. Navigate to `dist/mac/` folder
2. Copy `GrammrFix.app` to your Applications folder
3. Right-click and select "Open" (first time only)
4. Click "Open" when macOS warns about the app

### Step 4: First-Time Setup

1. **Grant Accessibility Permissions:**
   - Go to System Settings > Privacy & Security > Accessibility
   - Click the lock icon and enter your password
   - Find "GrammrFix" in the list (or "Electron" if not properly signed)
   - Toggle the switch to enable it

2. **Set Up API Key:**
   - The app needs a `.env` file with your Gemini API key
   - Create a `.env` file in the app's Resources folder, or
   - The app will look for `.env` in the same directory as the app

### Step 5: Create .env File

The app needs a `.env` file with your Gemini API key. You have two options:

#### Option A: Embed .env in the App (Development)

1. Create a `.env` file in the project root:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

2. The `.env` file will be included in the build (make sure it's not in `.gitignore` for this purpose, or copy it manually)

#### Option B: External .env File (Recommended)

1. After installing the app, create a `.env` file in:
   ```
   ~/Library/Application Support/GrammrFix/.env
   ```

2. Or create it in the same folder as the app

3. Modify `main.js` to look for `.env` in the app's user data directory

## Quick Build Commands

```bash
# Install dependencies
npm install

# Build for macOS (creates DMG)
npm run build:mac

# Build app bundle only (faster, for testing)
npm run build:dir

# Build everything
npm run dist
```

## Output Location

After building, you'll find:

- **DMG file**: `dist/GrammrFix-0.1.0.dmg`
- **App bundle**: `dist/mac/GrammrFix.app`
- **ZIP file**: `dist/GrammrFix-0.1.0-mac.zip` (if built)

## Installation Steps Summary

1. Build the app: `npm run build:mac`
2. Open the DMG from `dist/` folder
3. Drag to Applications folder
4. Open Applications, right-click GrammrFix, select "Open"
5. Grant accessibility permissions in System Settings
6. Set up `.env` file with API key (if needed)
7. Use `Alt+Space` to fix grammar!

## Troubleshooting

### "App is damaged and can't be opened"

This happens because the app isn't code-signed. To fix:

1. Right-click the app
2. Select "Open"
3. Click "Open" in the dialog

Or remove the quarantine attribute:
```bash
xattr -dr com.apple.quarantine /Applications/GrammrFix.app
```

### "Native module not available"

This is normal if you didn't build the native module. The app will use fallback methods (clipboard + keyboard simulation) which work fine.

### App doesn't appear in Accessibility settings

1. Make sure the app is running (check menu bar)
2. Try using the shortcut (`Alt+Space`) - this triggers permission request
3. Look for "GrammrFix" or "Electron" in the list

### API Key not found

1. Make sure `.env` file exists with `GEMINI_API_KEY=your_key`
2. Check that the file is in the correct location
3. Restart the app after creating/modifying `.env`

## Code Signing (Optional)

For distribution outside the Mac App Store, you can code-sign the app:

1. Get an Apple Developer ID
2. Add to `package.json`:
   ```json
   "build": {
     "mac": {
       "identity": "Developer ID Application: Your Name (TEAM_ID)"
     }
   }
   ```

3. Build with signing:
   ```bash
   npm run build:mac
   ```

## Notarization (Optional, for Distribution)

For apps distributed outside the Mac App Store, you may want to notarize:

1. Code-sign the app (see above)
2. Notarize with Apple
3. This allows the app to run without warnings on other Macs

## Building Without Native Module

If you don't want to build the native module (or can't due to Python issues):

1. The app will work with fallback methods
2. Just run: `npm run build:mac`
3. The build will skip native module compilation
4. The app will use clipboard + keyboard simulation instead

## File Structure After Build

```
dist/
├── GrammrFix-0.1.0.dmg          # Installer disk image
├── GrammrFix-0.1.0-mac.zip      # ZIP archive
└── mac/
    └── GrammrFix.app/            # App bundle
        ├── Contents/
        │   ├── MacOS/
        │   │   └── GrammrFix     # Executable
        │   ├── Resources/
        │   │   ├── app.asar      # Packaged app
        │   │   └── ...           # Other resources
        │   └── Info.plist        # App metadata
        └── ...
```

## Running the Built App

1. Install from DMG or copy app to Applications
2. Double-click to run
3. The app will appear in the menu bar (top right)
4. Use `Alt+Space` to fix grammar globally

## Updating the App

To update:

1. Build a new version: `npm run build:mac`
2. Install the new DMG
3. Replace the old app in Applications
4. Or use an auto-updater (requires additional setup)

## Distribution

To distribute the app to others:

1. Build the DMG: `npm run build:mac`
2. Share the DMG file from `dist/` folder
3. Recipients install by dragging to Applications
4. They'll need to grant accessibility permissions
5. They'll need to set up their own `.env` file with API key

## Notes

- The `.env` file is not included in the build by default (for security)
- Users need to create their own `.env` file with their API key
- The app works without the native module (uses fallback methods)
- Code signing is optional but recommended for distribution
- Notarization is required for distribution outside the Mac App Store (for Gatekeeper)

