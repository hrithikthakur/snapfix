# SnapFix

A system-wide grammar and spelling correction tool that works across all applications using Google's Gemini AI.

## Features

- ✅ **System-wide grammar fixing** - Works in any application
- ✅ **Global keyboard shortcut** - Press `Cmd+Shift+G` (Mac) or `Ctrl+Shift+G` (Windows/Linux)
- ✅ **Automatic text replacement** - Replaces selected text in place
- ✅ **Fast processing** - Uses Gemini 2.5 Flash for quick responses
- ✅ **Background operation** - Runs in system tray, no popups
- ✅ **Privacy-focused** - Only fixes typos, doesn't rewrite content

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up API key:**
   - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a `.env` file in the project root:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

3. **Run the app:**
   ```bash
   npm start
   ```

## Granting Accessibility Permissions (macOS)

For the app to automatically replace text, you need to grant accessibility permissions:

### ⚠️ Important: App Name in System Settings

When running the app with `npm start`, it will appear as **"Electron"** in System Settings (not "SnapFix"). This is normal when running Electron apps in development mode.

### Quick Method:
1. Right-click the SnapFix icon in your menu bar (top right)
2. Click **"Grant Accessibility Permissions"**
3. This will open System Settings directly to the Accessibility section
4. Look for **"Electron"** in the list (this is your app)
5. Click the lock icon (🔒) if needed and enter your password
6. Toggle the switch next to **"Electron"** to enable it

### Manual Method:
1. Make sure the app is running (you should see the menu bar icon)
2. Open **System Settings** (Apple menu > System Settings)
3. Go to **Privacy & Security**
4. Click on **Accessibility**
5. Click the lock icon (🔒) at the bottom to make changes (enter password)
6. **Look for "Electron" in the list** - this is your SnapFix app
   - The app appears as "Electron" because it's ruInstrument the app with analytics (PostHog, Mixpanel, or barebones logging).nning via the Electron framework
   - If you build a proper macOS app, it will show as "SnapFix"
7. Toggle the switch next to **"Electron"** to enable it (switch turns blue/green)
8. Quit and restart the app for permissions to take effect

### After Granting Permissions:
- Quit and restart the app for permissions to take effect
- The app will automatically detect when permissions are granted

## Usage

### Global Shortcut (Recommended):
1. **Select text** in any application (browser, text editor, etc.)
2. Press **`Cmd+Shift+G`** (Mac) or **`Ctrl+Shift+G`** (Windows/Linux)
3. Text is automatically fixed and replaced in place!

### Using Clipboard:
1. Copy text to clipboard (`Cmd+C` / `Ctrl+C`)
2. Press **`Cmd+Shift+G`** / **`Ctrl+Shift+G`**
3. Corrected text is placed in clipboard
4. Paste it where needed

### In-App Window:
1. Open the app window (click tray icon > Show Window)
2. Type or paste text
3. Click "Fix Grammar" or press `Cmd+Enter` / `Ctrl+Enter`
4. Text is replaced in the textarea

## Keyboard Shortcuts

- **`Cmd+Shift+G`** / **`Ctrl+Shift+G`** - Fix grammar globally (system-wide)
- **`Cmd+Enter`** / **`Ctrl+Enter`** - Fix grammar in app window
- **`Cmd+R`** / **`Ctrl+R`** - Reload app window
- **`Escape`** - Close popup (if shown)

## Troubleshooting

### Permissions Not Working?
- Make sure you've granted accessibility permissions (see above)
- Quit and restart the app after granting permissions
- Check System Settings > Privacy & Security > Accessibility

### Text Not Being Replaced?
- Ensure text is selected before pressing the shortcut
- Check that accessibility permissions are granted
- Try copying text first, then using the shortcut

### API Errors?
- Verify your API key is correct in the `.env` file
- Check your internet connection
- Ensure you have API quota available

## Requirements

- Node.js and npm
- Electron
- Gemini API key (free tier available)
- macOS: Accessibility permissions (for auto-replace)
- Windows/Linux: No special permissions needed

## Privacy & Security

- Text is sent to Google's Gemini API for processing
- Only spelling and typos are corrected
- No text is stored or logged
- API key is stored locally in `.env` file (not committed to git)

## License

MIT

