# Tray-Based Design & Secure IPC Bridge Guide

## Part 1: Hidden by Default - Tray-Based Design

### Why Tray-Based?

SnapFix is designed to run **completely in the background** - it's a utility app that should be invisible until you need it. This is perfect for a grammar checker because:

1. **Non-intrusive**: Doesn't clutter your dock/taskbar
2. **Always available**: Runs in background, ready when you press `Alt+Space`
3. **Minimal footprint**: No visible windows unless you explicitly open one
4. **Professional UX**: Similar to apps like Dropbox, Slack (when minimized), or system utilities

### How It Works

#### 1. **macOS: Accessory Activation Policy** (Line 805)

```javascript
if (process.platform === 'darwin') {
  app.setActivationPolicy('accessory');
}
```

**What this does**:
- **No dock icon**: App doesn't appear in macOS dock
- **No app switching**: Pressing Cmd+Tab won't show the app
- **Background only**: App runs silently in background
- **Can still show windows**: Windows can appear when needed, but won't activate the app

**Visual Result**:
- ✅ App icon appears in menu bar (top right)
- ❌ No dock icon
- ❌ Doesn't appear in Cmd+Tab switcher
- ✅ Can still show windows when needed

#### 2. **Window Hidden on Startup** (Line 841-843)

```javascript
createWindow();
createTray();

// Hide main window initially so it doesn't show when app starts
if (mainWindow) {
  mainWindow.hide();
}
```

**What this does**:
- Creates the window (so it's ready)
- Immediately hides it
- User never sees it on startup

**Why**:
- Window is ready if user wants to open it (via tray menu)
- But doesn't pop up automatically
- Clean startup experience

#### 3. **System Tray Icon** (Lines 164-241)

```javascript
function createTray() {
  // Create tray icon
  tray = new Tray(trayIcon);
  
  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Window', click: () => mainWindow.show() },
    { label: 'Fix Grammar (Global)', click: () => handleGlobalFix() },
    { label: 'Undo Last Correction', click: () => handleUndo() },
    { label: 'Quit', click: () => app.quit() }
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip('GrammrFix - Press Alt+Space to fix grammar');
}
```

**What this creates**:
- **Menu bar icon** (macOS) or **system tray icon** (Windows/Linux)
- **Right-click menu** with options:
  - Show Window
  - Fix Grammar
  - Undo
  - Quit
- **Tooltip** on hover

**User Experience**:
- Icon always visible in menu bar
- Right-click for options
- Double-click to show window (optional)

#### 4. **Window Close Behavior** (Lines 856-864)

```javascript
mainWindow.on('close', (event) => {
  if (!app.isQuitting) {
    event.preventDefault();  // Prevent actual close
    mainWindow.hide();        // Just hide instead
  }
});
```

**What this does**:
- When user clicks window close button (X)
- Instead of quitting, just hides the window
- App keeps running in tray
- User can reopen via tray menu

**Why**:
- App should stay running (it's a background utility)
- Closing window shouldn't quit the app
- Only "Quit" from tray menu actually quits

### Complete Flow

```
App Starts
  ↓
Set activation policy (macOS: no dock icon)
  ↓
Create window (but hide it immediately)
  ↓
Create tray icon (visible in menu bar)
  ↓
Register global shortcut (Alt+Space)
  ↓
App runs silently in background
  ↓
User can:
  - Press Alt+Space (works from anywhere)
  - Right-click tray icon (show menu)
  - Double-click tray icon (show window)
```

### Platform Differences

| Platform | Dock/Taskbar | Menu Bar | System Tray |
|----------|--------------|----------|-------------|
| **macOS** | ❌ Hidden (accessory policy) | ✅ Visible | N/A |
| **Windows** | ✅ Visible (can't hide) | N/A | ✅ Visible |
| **Linux** | ✅ Visible (can't hide) | N/A | ✅ Visible |

**Note**: On Windows/Linux, you can't completely hide from taskbar, but the window is still hidden by default.

---

## Part 2: Secure IPC Bridge with Preload Script

### The Security Problem

**Without preload script (INSECURE)**:
```javascript
// In renderer process (index.html)
const fs = require('fs');  // ❌ DANGEROUS!
const { exec } = require('child_process');  // ❌ DANGEROUS!

// Malicious website could:
fs.readFileSync('/etc/passwd');  // Read system files
exec('rm -rf ~');  // Delete user files
```

**Why this is dangerous**:
- Renderer process runs web content (HTML/JS)
- If you load external content, it could be malicious
- Full Node.js access = full system access
- Any XSS vulnerability = system compromise

### The Solution: Context Isolation + Preload

#### 1. **Context Isolation Enabled** (Line 59)

```javascript
webPreferences: {
  contextIsolation: true,  // ✅ Isolates renderer from Node.js
  nodeIntegration: false,   // ✅ Prevents direct Node.js access
  preload: path.join(__dirname, 'preload.js')  // ✅ Loads preload script
}
```

**What this does**:
- **`contextIsolation: true`**: Creates separate JavaScript context
  - Renderer can't access Node.js directly
  - Renderer can't access `require()`, `process`, `fs`, etc.
  - Isolated from main process

- **`nodeIntegration: false`**: Disables Node.js in renderer
  - No `require()` in renderer
  - No `process` object
  - No direct system access

- **`preload: preload.js`**: Runs preload script before renderer
  - Has access to both contexts
  - Can bridge between them safely

#### 2. **Preload Script** (`preload.js`)

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  setClipboard: (text) => ipcRenderer.invoke('set-clipboard', text),
  closePopup: () => ipcRenderer.invoke('close-popup'),
  makeWindowFocusable: () => ipcRenderer.invoke('make-window-focusable'),
  onProcessText: (callback) => {
    ipcRenderer.removeAllListeners('process-text');
    ipcRenderer.on('process-text', (event, text) => {
      callback(text);
    });
  }
});
```

**What this does**:

1. **`contextBridge.exposeInMainWorld()`**:
   - Creates a bridge between isolated context and main process
   - Exposes **only** the APIs you define
   - These APIs are available as `window.electronAPI` in renderer

2. **`ipcRenderer.invoke()`**:
   - Sends message to main process
   - Waits for response (async)
   - Main process handles it via `ipcMain.handle()`

3. **Limited API Surface**:
   - Only exposes what's needed
   - No file system access
   - No process execution
   - No direct Node.js access

#### 3. **Main Process Handlers** (in `main.js`)

```javascript
// Handle API key request
ipcMain.handle('get-api-key', () => {
  return process.env.GEMINI_API_KEY || '';
});

// Handle clipboard set
ipcMain.handle('set-clipboard', (event, text) => {
  clipboard.writeText(text);
});

// Handle popup close
ipcMain.handle('close-popup', () => {
  if (popupWindow) {
    popupWindow.close();
  }
});
```

**What this does**:
- Main process handles all sensitive operations
- Renderer can only request via IPC
- Main process validates and executes
- No direct access from renderer

### How It Works Together

```
┌─────────────────────────────────────────────────────────┐
│                    Main Process                        │
│  (Has full Node.js access)                            │
│                                                        │
│  ipcMain.handle('get-api-key', () => {                │
│    return process.env.GEMINI_API_KEY;                  │
│  });                                                   │
└────────────────────┬──────────────────────────────────┘
                     │ IPC (Inter-Process Communication)
                     │
┌────────────────────▼──────────────────────────────────┐
│              Preload Script                           │
│  (Runs in isolated context, has IPC access)          │
│                                                        │
│  contextBridge.exposeInMainWorld('electronAPI', {    │
│    getApiKey: () => ipcRenderer.invoke('get-api-key') │
│  });                                                   │
└────────────────────┬──────────────────────────────────┘
                     │ Exposes to renderer
                     │
┌────────────────────▼──────────────────────────────────┐
│              Renderer Process                         │
│  (Isolated, no Node.js access)                       │
│                                                        │
│  const apiKey = await window.electronAPI.getApiKey(); │
│  // ✅ Safe: Only gets API key, nothing else         │
│                                                        │
│  // ❌ This would fail:                              │
│  // const fs = require('fs');  // Error!             │
└───────────────────────────────────────────────────────┘
```

### Security Benefits

#### ✅ **What Renderer CAN Do**:
```javascript
// Safe operations via exposed API
await window.electronAPI.getApiKey();
await window.electronAPI.setClipboard('text');
window.electronAPI.closePopup();
```

#### ❌ **What Renderer CANNOT Do**:
```javascript
// All of these fail:
const fs = require('fs');  // Error: require is not defined
const { exec } = require('child_process');  // Error
process.env.SECRET_KEY;  // Error: process is not defined
localStorage.setItem('key', fs.readFileSync('/etc/passwd'));  // Error
```

### Real-World Example

**In `index.html`** (renderer process):
```javascript
// ✅ SAFE: Uses exposed API
window.addEventListener('DOMContentLoaded', async () => {
  try {
    apiKey = await window.electronAPI.getApiKey();  // IPC call
    if (!apiKey) {
      document.getElementById('status').textContent = 'API key not found';
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
```

**What happens**:
1. Renderer calls `window.electronAPI.getApiKey()`
2. Preload script receives call
3. Preload sends IPC message to main process
4. Main process handler executes: `return process.env.GEMINI_API_KEY`
5. Response sent back via IPC
6. Preload receives response
7. Renderer gets the API key (string only, no access to `process.env`)

### Why This Matters

#### **Scenario 1: Loading External Content**
```javascript
// If you load external website in renderer:
mainWindow.loadURL('https://example.com');

// Even if that site is malicious:
// ❌ Can't access your file system
// ❌ Can't execute system commands
// ❌ Can't read environment variables
// ✅ Can only use exposed APIs (getApiKey, setClipboard, etc.)
```

#### **Scenario 2: XSS Vulnerability**
```javascript
// If your HTML has XSS vulnerability:
document.getElementById('userInput').innerHTML = userContent;

// Attacker injects:
// <script>window.electronAPI.setClipboard('stolen data')</script>

// ✅ Damage is limited:
// - Can only call exposed APIs
// - Can't access file system
// - Can't execute commands
// - Can't read sensitive data (except what's exposed)
```

### Best Practices

#### 1. **Minimal API Surface**
```javascript
// ✅ GOOD: Only expose what's needed
contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  // That's it - nothing else
});

// ❌ BAD: Exposing too much
contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  readFile: (path) => ipcRenderer.invoke('read-file', path),  // Too permissive
  exec: (cmd) => ipcRenderer.invoke('exec', cmd),  // Dangerous!
});
```

#### 2. **Validate Inputs in Main Process**
```javascript
// ✅ GOOD: Validate in main process
ipcMain.handle('set-clipboard', (event, text) => {
  if (typeof text !== 'string' || text.length > 10000) {
    throw new Error('Invalid text');
  }
  clipboard.writeText(text);
});

// ❌ BAD: Trusting renderer
ipcMain.handle('set-clipboard', (event, text) => {
  clipboard.writeText(text);  // No validation!
});
```

#### 3. **Sanitize Outputs**
```javascript
// ✅ GOOD: Sanitize before sending
ipcMain.handle('get-api-key', () => {
  const key = process.env.GEMINI_API_KEY || '';
  return key.substring(0, 20) + '...';  // Only show partial
});

// ❌ BAD: Sending full key
ipcMain.handle('get-api-key', () => {
  return process.env.GEMINI_API_KEY;  // Full key exposed!
});
```

### Comparison: Secure vs Insecure

| Feature | Insecure (nodeIntegration: true) | Secure (contextIsolation: true) |
|---------|--------------------------------|--------------------------------|
| **Renderer Node.js access** | ✅ Full access | ❌ No access |
| **File system access** | ✅ Direct access | ❌ Only via IPC |
| **Process execution** | ✅ Direct access | ❌ Only via IPC |
| **Environment variables** | ✅ Direct access | ❌ Only via IPC |
| **XSS protection** | ❌ None | ✅ Limited to exposed APIs |
| **External content safety** | ❌ Dangerous | ✅ Safe (limited APIs) |

### Summary

**Tray-Based Design**:
- ✅ App runs in background
- ✅ No dock icon (macOS)
- ✅ Window hidden by default
- ✅ Accessible via tray menu
- ✅ Professional, non-intrusive UX

**Secure IPC Bridge**:
- ✅ Context isolation prevents direct Node.js access
- ✅ Preload script bridges safely
- ✅ Only exposes needed APIs
- ✅ Main process validates all operations
- ✅ Protects against XSS and malicious content

Both features work together to create a **secure, professional background utility** that's always available but never intrusive.

