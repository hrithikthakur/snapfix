# Build Instructions for GrammrFix Native Bridges

This document explains how to build the native text bridge modules for macOS and Windows.

## Prerequisites

### macOS
- Xcode Command Line Tools: `xcode-select --install`
- Node.js and npm
- Python 3.11 or earlier (Python 3.12+ removed distutils which node-gyp needs)
  - **Important:** Python 3.13+ will not work with node-gyp
  - Use Python 3.11: `brew install python@3.11`
  - Or install setuptools for Python 3.13: `pip3 install setuptools`

### Windows
- Visual Studio 2019 or later with C++ build tools
- .NET SDK 6.0 or later
- Node.js and npm
- Windows SDK

## macOS Native Module

The macOS native module uses Objective-C++ with the Accessibility API.

### Building

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the native module:**
   ```bash
   cd native/macOS
   node-gyp configure
   node-gyp build
   ```

   Or use the npm script:
   ```bash
   npm run build:native
   ```

3. **Rebuild for Electron:**
   ```bash
   npm run rebuild
   ```

### Troubleshooting

#### Python distutils Error (Python 3.12+)
**Error:** `ModuleNotFoundError: No module named 'distutils'`

**Solutions:**
1. **Use Python 3.11 (Recommended):**
   ```bash
   brew install python@3.11
   npm config set python /opt/homebrew/bin/python3.11
   npm run build:native
   ```

2. **Install setuptools for Python 3.13:**
   ```bash
   pip3 install setuptools
   npm run build:native
   ```

3. **Use the app without native modules:**
   - The app will automatically use fallback methods (clipboard + keyboard simulation)
   - Native build is optional - the app works without it
   - Just skip the build and run `npm start`

#### Other Issues
- If you get permission errors, make sure Xcode Command Line Tools are installed
- If the build fails, the app will use fallback methods automatically
- Make sure you have the macOS SDK installed
- You can skip native build entirely - the app works with fallback methods

## Windows Native Helper

The Windows helper uses C# with UI Automation.

### Building

1. **Install .NET SDK:**
   Download and install .NET SDK 6.0 or later from [Microsoft](https://dotnet.microsoft.com/download)

2. **Build the helper:**
   ```bash
   cd native/Windows
   dotnet build -c Release -r win-x64
   ```

3. **Verify the build:**
   The executable should be at:
   `native/Windows/bin/Release/net6.0/win-x64/TextBridge.exe`

### Testing the Helper

You can test the Windows helper manually:
```bash
cd native/Windows/bin/Release/net6.0/win-x64
TextBridge.exe getSelectedText
TextBridge.exe replaceSelectedText "test"
TextBridge.exe hasPermissions
```

## Integration

The native modules are automatically loaded by `native/textBridge.js`:
- macOS: Loads the `.node` addon
- Windows: Calls the `TextBridge.exe` helper
- Fallback: Uses clipboard + keyboard simulation if native modules are unavailable

## Permission Requirements

### macOS
- **Accessibility permissions** are required
- The app must be enabled in System Settings > Privacy & Security > Accessibility
- The native module checks permissions using `AXIsProcessTrusted()`

### Windows
- **UI Automation** works by default on Windows
- No special permissions required (unlike macOS)

## Development

### Testing Native Modules

1. **macOS:**
   ```javascript
   const textBridge = require('./native/textBridge');
   const hasPerms = await textBridge.hasAccessibilityPermissions();
   const text = await textBridge.getSelectedText();
   const success = await textBridge.replaceSelectedText('new text');
   ```

2. **Windows:**
   ```bash
   cd native/Windows/bin/Release/net6.0/win-x64
   TextBridge.exe getSelectedText
   ```

### Debugging

- Check console logs for errors
- Use `console.log` in `native/textBridge.js` to debug
- For macOS: Check Xcode console for native module errors
- For Windows: Check Event Viewer for UI Automation errors

## File Structure

```
grammrfix/
├── native/
│   ├── textBridge.js          # Node.js bridge module
│   ├── macOS/
│   │   ├── textBridge.cpp     # Native C++ implementation
│   │   └── binding.gyp        # Build configuration
│   └── Windows/
│       ├── TextBridge.cs      # C# implementation
│       └── TextBridge.csproj  # Project file
└── main.js                    # Electron main process (uses textBridge)
```

## Notes

- The native modules provide direct access to system accessibility APIs
- If native modules fail, the system falls back to clipboard + keyboard simulation
- The fallback method works but is less reliable than native APIs
- Native modules require compilation for each platform
- Electron apps need to be rebuilt when Electron version changes

## Troubleshooting

### "Cannot find module" error
- Make sure you've built the native module
- Check that the `.node` file exists in `native/macOS/build/Release/`
- Try running `npm run rebuild`

### Permission errors on macOS
- Grant accessibility permissions in System Settings
- Restart the app after granting permissions
- Check that the app appears in Accessibility settings

### Windows helper not found
- Make sure you've built the C# project
- Check that `TextBridge.exe` exists in the expected path
- Verify the path in `native/textBridge.js`

### Build errors
- Make sure all prerequisites are installed
- Try cleaning and rebuilding: `node-gyp clean && node-gyp build`
- Check that you have the correct Node.js and Electron versions

