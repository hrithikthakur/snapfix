# Native Text Bridge Modules

This directory contains platform-specific native implementations for getting and replacing selected text in applications.

## Structure

```
native/
├── textBridge.js          # Node.js bridge module (loads platform-specific implementations)
├── macOS/
│   ├── textBridge.cpp     # macOS native module (Objective-C++)
│   └── binding.gyp        # Build configuration for node-gyp
└── Windows/
    ├── TextBridge.cs      # Windows native helper (C#)
    └── TextBridge.csproj  # .NET project file
```

## macOS Implementation

### Technology
- **Language:** Objective-C++
- **API:** macOS Accessibility API (ApplicationServices framework)
- **Binding:** Node Addon API (node-addon-api)

### Functions
- `getSelectedText()` - Gets currently selected text from focused application
- `replaceSelectedText(newText)` - Replaces selected text in place
- `hasAccessibilityPermissions()` - Checks if accessibility permissions are granted

### Building
```bash
cd native/macOS
node-gyp configure
node-gyp build
```

### Requirements
- Xcode Command Line Tools
- Node.js and npm
- Python 3 (for node-gyp)
- macOS SDK

### Permissions
- Requires Accessibility permissions
- Checked using `AXIsProcessTrusted()`
- User must grant permissions in System Settings

## Windows Implementation

### Technology
- **Language:** C#
- **API:** Windows UI Automation (IUIAutomationTextPattern)
- **Runtime:** .NET 6.0

### Functions
- `GetSelectedText()` - Gets currently selected text from focused application
- `ReplaceSelectedText(newText)` - Replaces selected text in place
- `HasAccessibilityPermissions()` - Checks if UI Automation is available

### Building
```bash
cd native/Windows
dotnet build -c Release -r win-x64
```

### Requirements
- .NET SDK 6.0 or later
- Visual Studio 2019+ (optional, for IDE support)

### Permissions
- No special permissions required
- UI Automation works by default on Windows

## Node.js Bridge

The `textBridge.js` module provides a unified API that:
1. Automatically detects the platform
2. Loads the appropriate native module
3. Falls back to clipboard method if native module is unavailable
4. Provides consistent error handling

### Usage
```javascript
const textBridge = require('./native/textBridge');

// Check permissions
const hasPerms = await textBridge.hasAccessibilityPermissions();

// Get selected text
const text = await textBridge.getSelectedText();

// Replace selected text
const success = await textBridge.replaceSelectedText('new text');
```

## Fallback Method

If native modules are unavailable or fail, the system falls back to:
1. Clipboard-based text retrieval (simulate Copy)
2. Clipboard-based text replacement (set clipboard, simulate Paste)
3. Keyboard simulation for paste operation

This ensures the app works even if native modules can't be built or fail at runtime.

## Testing

### macOS
```bash
cd native/macOS
node-gyp build
node -e "const m = require('./build/Release/textBridge.node'); console.log(m.hasAccessibilityPermissions());"
```

### Windows
```bash
cd native/Windows/bin/Release/net6.0/win-x64
TextBridge.exe getSelectedText
TextBridge.exe replaceSelectedText "test"
TextBridge.exe hasPermissions
```

## Troubleshooting

### macOS: "Cannot find module"
- Make sure you've built the native module
- Check that the `.node` file exists in `build/Release/`
- Try running `npm run rebuild`

### Windows: "TextBridge.exe not found"
- Make sure you've built the C# project
- Check that the executable exists in the expected path
- Verify the path in `textBridge.js`

### Permission Errors
- **macOS:** Grant accessibility permissions in System Settings
- **Windows:** Usually works by default, but may require UAC elevation for some apps

## Integration

The native modules are automatically loaded by the Electron main process:
1. `main.js` requires `./native/textBridge`
2. `textBridge.js` loads the appropriate native module
3. If loading fails, fallback methods are used
4. All errors are handled gracefully

## Future Enhancements

1. **Linux Support:** Implement using AT-SPI
2. **Better Error Messages:** More specific error handling
3. **Performance:** Cache focused elements to reduce API calls
4. **Testing:** Unit tests for native modules

