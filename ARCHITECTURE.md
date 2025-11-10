# GrammrFix Architecture Documentation

## Overview

GrammrFix uses native system APIs to replace selected text in-place without using the clipboard. The architecture consists of:

1. **Electron Main Process** - Handles UI, shortcuts, and orchestrates the flow
2. **Native Text Bridge** - Platform-specific modules for text manipulation
3. **Gemini API Integration** - Existing text correction logic (unchanged)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                     │
│  (main.js)                                                   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  handleGlobalFix()                                 │    │
│  │  1. Check permissions                              │    │
│  │  2. Get selected text (native bridge)              │    │
│  │  3. Call Gemini API (processTextInBackground)      │    │
│  │  4. Replace text (native bridge)                   │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Native Text Bridge (textBridge.js)              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   macOS      │  │   Windows    │  │   Fallback   │     │
│  │  (Native)    │  │  (C# Helper) │  │ (Clipboard)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Platform-Specific Implementations               │
│                                                              │
│  macOS:  Accessibility API (AXUIElement)                    │
│  Windows: UI Automation (IUIAutomationTextPattern)          │
│  Fallback: Clipboard + Keyboard Simulation                  │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Electron Main Process (`main.js`)

**Responsibilities:**
- Register global hotkey (Alt+Space)
- Check accessibility permissions
- Orchestrate text retrieval, correction, and replacement
- Handle errors and fallbacks
- Show notifications

**Key Functions:**
- `handleGlobalFix()` - Main entry point when shortcut is pressed
- `processTextInBackground()` - Calls Gemini API (unchanged)
- `callGeminiAPI()` - Existing Gemini integration (unchanged)

### 2. Native Text Bridge (`native/textBridge.js`)

**Responsibilities:**
- Load platform-specific native modules
- Provide unified API for text operations
- Handle fallbacks if native modules are unavailable

**Exported Functions:**
- `hasAccessibilityPermissions()` - Check if permissions are granted
- `getSelectedText()` - Get currently selected text
- `replaceSelectedText(newText)` - Replace selected text in place

### 3. macOS Native Module (`native/macOS/textBridge.cpp`)

**Technology:**
- Objective-C++ with Node Addon API
- macOS Accessibility API (ApplicationServices framework)

**Key Functions:**
- `getSelectedText()` - Uses `AXUIElement` to get selected text
- `replaceSelectedText()` - Uses `AXUIElement` to replace text
- `hasAccessibilityPermissions()` - Uses `AXIsProcessTrusted()`

**How it works:**
1. Gets the focused application using `AXUIElementCreateSystemWide()`
2. Traverses the accessibility hierarchy to find the focused text element
3. Reads the selected text using `kAXSelectedTextAttribute`
4. Replaces text by setting `kAXSelectedTextAttribute` or using text insertion

### 4. Windows Native Helper (`native/Windows/TextBridge.cs`)

**Technology:**
- C# with .NET 6.0
- Windows UI Automation API

**Key Functions:**
- `GetSelectedText()` - Uses `TextPattern` to get selected text
- `ReplaceSelectedText()` - Uses `TextPattern` to replace text
- `HasAccessibilityPermissions()` - Checks UI Automation availability

**How it works:**
1. Gets the focused element using `AutomationElement.FocusedElement`
2. Retrieves `TextPattern` from the focused element
3. Gets selected text ranges using `TextPattern.GetSelection()`
4. Replaces text using `TextPatternRange.SetText()`

**Execution:**
- Compiled to `TextBridge.exe`
- Called via `child_process.exec()` from Node.js
- Command-line interface for text operations

### 5. Fallback Method

**When used:**
- Native modules are not available
- Native modules fail to get/replace text
- Permissions are not granted

**Implementation:**
- Uses clipboard to get selected text (simulate Copy)
- Uses clipboard to set corrected text
- Uses keyboard simulation to paste (simulate Paste)

## Data Flow

### Successful Flow (Native API)

1. User presses `Alt+Space`
2. `handleGlobalFix()` is called
3. Check permissions using `textBridge.hasAccessibilityPermissions()`
4. Get selected text using `textBridge.getSelectedText()`
5. Call `processTextInBackground(textToFix)` → Gemini API
6. Get corrected text from Gemini
7. Replace text using `textBridge.replaceSelectedText(correctedText)`
8. Show success notification

### Fallback Flow (Clipboard)

1. User presses `Alt+Space`
2. `handleGlobalFix()` is called
3. Native bridge fails or returns empty
4. Fallback to clipboard method
5. Get text from clipboard (or simulate Copy)
6. Call Gemini API
7. Set corrected text to clipboard
8. Simulate Paste using keyboard
9. Show success notification

## Permission Handling

### macOS

**Required Permissions:**
- Accessibility permissions (System Settings > Privacy & Security > Accessibility)

**How it's checked:**
- Native module: `AXIsProcessTrusted()`
- Fallback: Try to use AppleScript (will fail if no permissions)

**User Experience:**
- Dialog appears if permissions are missing
- Option to open System Settings
- App appears as "Electron" in Accessibility settings

### Windows

**Required Permissions:**
- None (UI Automation works by default)
- May require UAC elevation for some applications

**How it's checked:**
- Check if `AutomationElement.RootElement` is accessible
- Usually returns true by default

## Error Handling

### Native Module Errors

**Handling:**
- Try native method first
- If it fails or returns empty, fall back to clipboard method
- Log errors to console
- Show user-friendly notifications

### Permission Errors

**Handling:**
- Check permissions before attempting text operations
- Show dialog on macOS if permissions are missing
- Provide instructions to grant permissions
- Fall back to clipboard method if permissions are denied

### API Errors

**Handling:**
- Existing Gemini API error handling (unchanged)
- Show error notifications
- Don't attempt text replacement if API fails

## Integration Points

### Gemini API Integration

**Location:** `processTextInBackground()` function in `main.js`

**Unchanged:**
- All Gemini API logic remains the same
- Same models, timeouts, and error handling
- Same API key handling via `.env` file

**Integration:**
```javascript
// In handleGlobalFix()
const correctedText = await processTextInBackground(textToFix);
// This calls the existing Gemini API integration
```

### Native Bridge Integration

**Location:** `native/textBridge.js`

**Platform Detection:**
- Automatically detects platform
- Loads appropriate native module
- Falls back to clipboard if native module unavailable

**Usage:**
```javascript
const textBridge = require('./native/textBridge');
const text = await textBridge.getSelectedText();
const success = await textBridge.replaceSelectedText(correctedText);
```

## Build Requirements

### macOS
- Xcode Command Line Tools
- Node.js and npm
- Python 3 (for node-gyp)
- macOS SDK

### Windows
- Visual Studio 2019+ with C++ tools
- .NET SDK 6.0+
- Node.js and npm
- Windows SDK

## Testing

### Manual Testing

1. **Test Native Module:**
   ```javascript
   const textBridge = require('./native/textBridge');
   const hasPerms = await textBridge.hasAccessibilityPermissions();
   const text = await textBridge.getSelectedText();
   const success = await textBridge.replaceSelectedText('test');
   ```

2. **Test Full Flow:**
   - Select text in any application
   - Press `Alt+Space`
   - Verify text is replaced in place

3. **Test Fallback:**
   - Disable native module (rename file)
   - Test that fallback method works
   - Verify clipboard is used

### Debugging

**Native Module Debugging:**
- Check console logs for errors
- Use Xcode for macOS native debugging
- Use Visual Studio for Windows C# debugging

**Bridge Debugging:**
- Add `console.log` statements in `textBridge.js`
- Check error messages in Electron console
- Verify native module paths are correct

## Future Enhancements

1. **Linux Support:**
   - Implement using AT-SPI (Assistive Technology Service Provider Interface)
   - Similar to macOS Accessibility API

2. **Better Error Messages:**
   - More specific error messages for different failure modes
   - Suggestions for fixing permission issues

3. **Performance Optimization:**
   - Cache focused element to reduce API calls
   - Optimize text replacement for large selections

4. **Testing:**
   - Unit tests for native modules
   - Integration tests for full flow
   - Automated testing across platforms

