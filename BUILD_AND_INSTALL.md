# Build and Install GrammrFix on macOS

## Quick Steps

1. **Build the app:**
   ```bash
   npm run build:mac
   ```

2. **Install:**
   - Open `dist/GrammrFix-0.1.0.dmg`
   - Drag to Applications folder
   - Right-click → Open (first time)
   - Click "Open" when warned

3. **Set up API key:**
   ```bash
   mkdir -p ~/Library/Application\ Support/GrammrFix
   echo "GEMINI_API_KEY=your_key_here" > ~/Library/Application\ Support/GrammrFix/.env
   ```

4. **Grant permissions:**
   - System Settings > Privacy & Security > Accessibility
   - Enable "GrammrFix" (or "Electron")

5. **Use it:**
   - Select text anywhere
   - Press `Alt+Space`
   - Done! ✨

## Detailed Instructions

See `INSTALLATION.md` for complete instructions.

## Troubleshooting

- **"App is damaged"**: Right-click → Open, or run:
  ```bash
  xattr -dr com.apple.quarantine /Applications/GrammrFix.app
  ```

- **API key not found**: Make sure `.env` file exists in the correct location

- **Can't find app in Accessibility**: Try using `Alt+Space` first to trigger permission request

## Build Commands

```bash
# Build DMG installer (recommended)
npm run build:mac

# Build app bundle only (faster, for testing)
npm run build:dir

# Build everything
npm run dist
```

## Output

After building, find your app in:
- `dist/GrammrFix-0.1.0.dmg` - Installer
- `dist/mac/GrammrFix.app` - App bundle

