# Quick Start: Build and Install GrammrFix on macOS

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Build the App

```bash
npm run build:mac
```

This will create a `.dmg` file in the `dist` folder (takes 1-2 minutes).

## Step 3: Install the App

1. Open `dist/GrammrFix-0.1.0.dmg`
2. Drag `GrammrFix.app` to your Applications folder
3. Open Applications folder, find `GrammrFix.app`
4. **Right-click** and select **"Open"** (first time only)
5. Click **"Open"** when macOS warns about the app

## Step 4: Set Up API Key

Create a `.env` file in one of these locations:

**Option A (Recommended):**
```bash
mkdir -p ~/Library/Application\ Support/GrammrFix
echo "GEMINI_API_KEY=your_api_key_here" > ~/Library/Application\ Support/GrammrFix/.env
```

**Option B (Using the script):**
```bash
./build/create-env.sh
```

**Option C (In project folder - development only):**
```bash
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

## Step 5: Grant Accessibility Permissions

1. Open **System Settings** > **Privacy & Security** > **Accessibility**
2. Click the lock icon and enter your password
3. Find **"GrammrFix"** in the list (or **"Electron"** if not signed)
4. Toggle the switch to enable it

**Tip:** Use the shortcut `Alt+Space` first - this triggers a permission request.

## Step 6: Use the App!

1. Select text in any application
2. Press **`Alt+Space`** to fix grammar
3. The text will be replaced automatically!

## Troubleshooting

### "App is damaged and can't be opened"
- Right-click the app → Select "Open"
- Or run: `xattr -dr com.apple.quarantine /Applications/GrammrFix.app`

### "API Key not found"
- Make sure `.env` file exists with `GEMINI_API_KEY=your_key`
- Restart the app after creating/modifying `.env`

### App doesn't appear in Accessibility settings
- Make sure the app is running (check menu bar)
- Try using `Alt+Space` shortcut first
- Look for "GrammrFix" or "Electron" in the list

## Building Options

```bash
# Build DMG (recommended)
npm run build:mac

# Build app bundle only (faster, for testing)
npm run build:dir

# Build everything
npm run dist
```

## Output Location

After building:
- **DMG**: `dist/GrammrFix-0.1.0.dmg`
- **App**: `dist/mac/GrammrFix.app`

## That's It!

Your app is now installed and ready to use. Press `Alt+Space` anywhere to fix grammar!

