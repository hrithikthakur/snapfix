# SnapFix (GrammrFix) Codebase Walkthrough

## 📁 Project Structure

```
grammrfix/
├── main.js                    # Main Electron process - core app logic
├── preload.js                 # Security bridge between main and renderer
├── index.html                 # Main app window UI
├── popup.html                 # Popup window UI
├── statusOverlay.html        # Status overlay UI
├── package.json              # Dependencies and build config
│
├── native/                    # Native platform-specific code
│   ├── textBridge.js         # JavaScript bridge to native modules
│   ├── macOS/
│   │   ├── textBridge.cpp    # macOS native module (C++)
│   │   └── binding.gyp       # Build configuration
│   └── Windows/
│       ├── TextBridge.cs     # Windows native helper (C#)
│       └── TextBridge.csproj # .NET project file
│
├── analytics.js              # Basic analytics module
├── analytics-enhanced.js     # Enhanced analytics with product metrics
├── analytics-dashboard.html  # Analytics visualization dashboard
│
├── landing/                  # Landing page (Firebase hosted)
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── firebase.json
│
├── build/                    # Build configuration
│   └── entitlements.mac.plist
│
└── dist/                     # Built application packages
```

## 🏗️ Architecture Overview

### High-Level Flow

```
User Action (Alt+Space)
    ↓
main.js: handleGlobalFix()
    ↓
Check Permissions → textBridge.hasAccessibilityPermissions()
    ↓
Get Selected Text → textBridge.getSelectedText()
    ↓
Call Gemini API → processTextInBackground()
    ↓
Replace Text → textBridge.replaceSelectedText()
    ↓
Show Status Overlay
```

## 🔑 Key Files Explained

### 1. `main.js` - The Heart of the Application

**Purpose**: Main Electron process that orchestrates everything.

**Key Components**:

#### **App Initialization** (lines 799-874)
```javascript
app.whenReady().then(async () => {
  // Set macOS activation policy (no dock icon)
  app.setActivationPolicy('accessory');
  
  // Check permissions
  // Create windows
  // Create system tray
  // Register global shortcut (Alt+Space)
});
```

#### **Global Shortcut Handler** (lines 243-393)
```javascript
async function handleGlobalFix() {
  // 1. Check permissions
  // 2. Get selected text (native or clipboard fallback)
  // 3. Call Gemini API
  // 4. Replace text in place
  // 5. Show status overlay
}
```

**Flow Breakdown**:
1. **Permission Check**: Uses `textBridge.hasAccessibilityPermissions()`
2. **Text Retrieval**: Tries native method first, falls back to clipboard
3. **API Call**: Calls `processTextInBackground()` which uses Gemini API
4. **Text Replacement**: Tries native replacement, falls back to clipboard paste
5. **User Feedback**: Shows status overlay (success/error/processing)

#### **Gemini API Integration** (lines 519-629)
```javascript
async function callGeminiAPI(text, apiKey) {
  // Tries multiple models in order:
  // 1. gemini-2.5-flash-lite (fastest)
  // 2. gemini-2.5-flash (balanced)
  // 3. gemini-1.5-flash (fallback)
  
  // 6-second timeout
  // Returns corrected text
}
```

**Features**:
- Model fallback chain for reliability
- 6-second timeout
- Token estimation based on input length
- Error handling with retries

#### **Undo System** (lines 50-52, 359-369, 470-517)
```javascript
const undoStack = [];  // Stores last 10 corrections

// On correction:
undoStack.push({ originalText, correctedText, timestamp });

// On undo:
const lastCorrection = undoStack.pop();
// Restore original text
```

#### **Status Overlay** (lines 631-789)
- Floating window showing processing status
- Types: `processing`, `success`, `error`
- Auto-dismisses after timeout
- Positioned at screen center

#### **System Tray** (lines 164-241)
- Menu bar icon (macOS) or system tray (Windows)
- Menu options:
  - Show Window
  - Fix Grammar (Global)
  - Undo Last Correction
  - Grant Accessibility Permissions (macOS)
  - Quit

### 2. `native/textBridge.js` - Platform Abstraction Layer

**Purpose**: Provides unified API for platform-specific text operations.

**Key Functions**:

```javascript
// Check if app has accessibility permissions
hasAccessibilityPermissions() → Promise<boolean>

// Get currently selected text
getSelectedText() → Promise<string>

// Replace selected text with new text
replaceSelectedText(newText) → Promise<boolean>
```

**Platform Support**:
- **macOS**: Uses native C++ module (textBridge.node)
- **Windows**: Uses C# helper executable (TextBridge.exe)
- **Fallback**: Clipboard + keyboard simulation

**Fallback Strategy**:
1. Try native method
2. If fails → try clipboard method
3. If still fails → return false/empty

### 3. `native/macOS/textBridge.cpp` - macOS Native Module

**Technology**: 
- Objective-C++ with Node Addon API
- macOS Accessibility API (ApplicationServices framework)

**How It Works**:
1. Gets focused application using `AXUIElementCreateSystemWide()`
2. Traverses accessibility hierarchy to find focused text element
3. Reads selected text using `kAXSelectedTextAttribute`
4. Replaces text by setting `kAXSelectedTextAttribute`

**Build Process**:
- Uses `node-gyp` to compile C++ to `.node` file
- Requires Xcode Command Line Tools
- Output: `native/macOS/build/Release/textBridge.node`

### 4. `native/Windows/TextBridge.cs` - Windows Native Helper

**Technology**:
- C# with .NET 6.0
- Windows UI Automation API

**How It Works**:
1. Gets focused element using `AutomationElement.FocusedElement`
2. Retrieves `TextPattern` from focused element
3. Gets selected text ranges using `TextPattern.GetSelection()`
4. Replaces text using `TextPatternRange.SetText()`

**Execution**:
- Compiled to `TextBridge.exe`
- Called via `child_process.exec()` from Node.js
- Command-line interface: `TextBridge.exe getSelectedText`

### 5. `preload.js` - Security Bridge

**Purpose**: Exposes safe APIs to renderer process (UI).

**Exposed APIs**:
```javascript
window.electronAPI = {
  getApiKey(),           // Get API key from main process
  setClipboard(text),    // Set clipboard text
  closePopup(),          // Close popup window
  makeWindowFocusable(), // Make window focusable
  onProcessText(callback) // Listen for text processing events
}
```

**Why It Exists**: 
- Electron security best practice
- Prevents renderer from accessing Node.js directly
- Uses `contextBridge` for secure IPC

### 6. `index.html` - Main Window UI

**Purpose**: Main application window (optional, app runs in tray).

**Features**:
- Text input area
- "Fix Grammar" button
- Keyboard shortcuts (Cmd+Enter)
- Shows API key status

### 7. Analytics Modules

#### `analytics.js` - Basic Analytics
- Supports PostHog, Mixpanel, or file logging
- Tracks events with properties
- User identification

#### `analytics-enhanced.js` - Product Metrics
- Tracks specific product metrics:
  - Shortcut activation rates
  - Daily usage frequency
  - AI failure rates
  - Replacement failure rates
  - Permission denial rates
  - Method usage (native vs clipboard)
  - Text length distribution
  - Power user identification
  - Onboarding effectiveness
- Generates metrics reports
- Stores data in JSON files

## 🔄 Data Flow Examples

### Example 1: Successful Grammar Fix (Native Method)

```
1. User selects text in Safari
2. User presses Alt+Space
3. main.js: handleGlobalFix() called
4. textBridge.hasAccessibilityPermissions() → true
5. textBridge.getSelectedText() → "This is a sentance"
6. processTextInBackground() → calls Gemini API
7. Gemini returns: "This is a sentence"
8. textBridge.replaceSelectedText("This is a sentence") → true
9. Status overlay shows: "Text fixed!"
10. undoStack.push({ originalText, correctedText })
```

### Example 2: Fallback to Clipboard

```
1. User selects text in app without native support
2. User presses Alt+Space
3. textBridge.getSelectedText() → "" (empty, native failed)
4. Fallback: clipboard.readText() → "This is a sentance"
5. processTextInBackground() → calls Gemini API
6. Gemini returns: "This is a sentence"
7. textBridge.replaceSelectedText() → false (native failed)
8. Fallback: clipboard.writeText("This is a sentence")
9. Simulate Cmd+V (paste)
10. Status overlay shows: "Text fixed!"
```

### Example 3: Permission Denied

```
1. User presses Alt+Space (first time)
2. textBridge.hasAccessibilityPermissions() → false
3. Show dialog: "Accessibility Permissions Required"
4. User clicks "Open System Settings"
5. openAccessibilitySettings() → opens macOS System Settings
6. User grants permissions
7. Next time: permissions check passes
```

## 🛠️ Build System

### Development
```bash
npm start              # Run app in development
npm run build:native  # Build native modules
```

### Production
```bash
npm run build         # Build for all platforms
npm run build:mac     # Build macOS app
```

**Build Output**:
- `dist/mac/GrammrFix.app` - macOS application
- `dist/GrammrFix-0.1.0.dmg` - macOS installer
- `dist/GrammrFix-0.1.0.zip` - macOS archive

## 🔐 Security & Privacy

### API Key Handling
- Stored in `.env` file (not committed)
- Loaded from multiple locations:
  1. Project root (development)
  2. User data directory (production)
  3. Home directory (`~/.grammrfix/.env`)

### Text Privacy
- Text is sent to Gemini API for processing
- **No text is stored locally** (except undo stack, cleared on quit)
- Analytics tracks metadata (length, method) but **not content**

### Permissions
- macOS: Requires Accessibility permissions
- Windows: No special permissions needed
- Linux: Not yet implemented

## 🎯 Key Design Decisions

### 1. **Native Modules First, Fallback Always**
- Always tries native method for best UX
- Falls back to clipboard if native fails
- Ensures app works even without permissions

### 2. **Model Fallback Chain**
- Tries fastest model first (flash-lite)
- Falls back to more reliable models
- Ensures API calls succeed

### 3. **Tray-Based Design**
- App runs in background
- No dock icon (macOS)
- Minimal UI footprint

### 4. **Status Overlay**
- Non-intrusive feedback
- Auto-dismisses
- Shows processing state

### 5. **Undo System**
- Stores last 10 corrections
- Allows quick reversal
- Limited to prevent memory issues

## 📊 Analytics Integration Points

To add analytics tracking, add calls at these points:

```javascript
// In handleGlobalFix():
analytics.trackShortcutActivated();
analytics.trackGrammarFixAttempted(textLength, method);
analytics.trackGrammarFixSucceeded(textLength, method, responseTime);
analytics.trackAIFailure(errorType, errorMessage, textLength);
analytics.trackReplacementFailure(method, textLength);
analytics.trackPermissionDenied();
analytics.trackPermissionGranted();
```

## 🐛 Debugging Tips

### Check Native Module
```javascript
const textBridge = require('./native/textBridge');
console.log('Native module loaded:', textBridge !== null);
const hasPerms = await textBridge.hasAccessibilityPermissions();
console.log('Has permissions:', hasPerms);
```

### Check API Key
```javascript
console.log('API Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');
```

### Enable Verbose Logging
- Check Electron console (View → Toggle Developer Tools)
- Check terminal output for native module errors
- Check `~/Library/Application Support/GrammrFix/analytics/` for logs

## 🚀 Future Enhancements

Based on `FEATURE_IDEAS.md`:
- Settings window
- Custom keyboard shortcuts
- Correction history
- Multiple correction modes
- Preview before apply
- App whitelist/blacklist
- Dark mode
- API usage tracking

## 📝 Configuration

### Environment Variables (`.env`)
```env
GEMINI_API_KEY=your_key_here
ANALYTICS_PROVIDER=file|posthog|mixpanel
POSTHOG_API_KEY=your_key_here
MIXPANEL_TOKEN=your_token_here
```

### Build Configuration (`package.json`)
- App ID: `com.grammrfix.app`
- Product Name: `GrammrFix`
- macOS minimum: 10.13.0
- Targets: DMG, ZIP for x64 and arm64

## 🎓 Learning Resources

- **Electron Docs**: https://www.electronjs.org/docs
- **Node Addon API**: https://nodejs.github.io/node-addon-api/
- **macOS Accessibility**: https://developer.apple.com/documentation/applicationservices
- **Windows UI Automation**: https://docs.microsoft.com/en-us/windows/win32/winauto/entry-uiauto-win32

## 🔍 Quick Reference

### Main Functions
- `handleGlobalFix()` - Main entry point for grammar fixing
- `processTextInBackground()` - Calls Gemini API
- `callGeminiAPI()` - HTTP request to Gemini
- `handleUndo()` - Undo last correction
- `showStatusOverlay()` - Show user feedback
- `createTray()` - Create system tray icon

### Native Bridge Functions
- `hasAccessibilityPermissions()` - Check permissions
- `getSelectedText()` - Get selected text
- `replaceSelectedText()` - Replace selected text

### File Locations
- Main process: `main.js`
- Native bridge: `native/textBridge.js`
- macOS native: `native/macOS/textBridge.cpp`
- Windows native: `native/Windows/TextBridge.cs`
- Analytics: `analytics-enhanced.js`
- Landing page: `landing/`

---

**This codebase is well-structured, follows Electron best practices, and has a clear separation of concerns between platform-specific code and application logic.**

