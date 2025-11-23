const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, clipboard, nativeImage, Notification, screen, dialog, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const analytics = require('./analytics');

// Config management
let currentShortcut = 'Alt+Space';

function getConfigPath() {
  return path.join(app.getPath('userData'), 'config.json');
}

function loadConfig() {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.shortcut) {
        currentShortcut = config.shortcut;
      }
      if (config.soundEnabled !== undefined) {
        soundEnabled = config.soundEnabled;
      }
    }
  } catch (e) {
    console.error('Error loading config:', e);
  }
}

function saveConfig(updates) {
  try {
    const configPath = getConfigPath();
    let currentConfig = {};
    if (fs.existsSync(configPath)) {
      try {
        currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (e) {
        // Ignore parse error, start fresh
      }
    }
    const newConfig = { ...currentConfig, ...updates };
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
  } catch (e) {
    console.error('Error saving config:', e);
  }
}

function registerFixShortcut(shortcut) {
  // Unregister old shortcut if it exists (we might need to track it if we want to be precise, 
  // but for now we can just unregister the previous currentShortcut if we haven't updated it yet?
  // simpler: unregister the specific shortcut we are about to set, to avoid duplicates, 
  // and unregister the OLD one. 
  // Actually, safest is to unregister all and re-register everything, OR track the old one.
  // Let's track the old one?
  // For now, let's assume we only have one "fix" shortcut.
  
  // Unregister the previous shortcut if we have one recorded or just try to unregister 'Alt+Space' as default
  // But we don't want to clear Cmd+R.
  
  // Best approach: Unregister the *current* shortcut before updating the variable, then register new.
  // But here `shortcut` is the NEW one. `currentShortcut` holds the OLD one (if called before update).
  
  if (globalShortcut.isRegistered(currentShortcut)) {
    globalShortcut.unregister(currentShortcut);
  }
  
  // Also unregister the new one just in case
  if (globalShortcut.isRegistered(shortcut)) {
     globalShortcut.unregister(shortcut);
  }

  const ret = globalShortcut.register(shortcut, () => {
    handleGlobalFix();
  });

  if (!ret) {
    console.log('Global shortcut registration failed for:', shortcut);
    return false;
  }
  
  console.log('Global shortcut registered:', shortcut);
  currentShortcut = shortcut;
  return true;
}

// Load .env file from multiple possible locations
function loadEnvFile() {
  const envPaths = [
    path.join(__dirname, '.env'), // Same directory as main.js (development)
    path.join(app.getPath('userData'), '.env'), // User data directory (production)
    path.join(os.homedir(), '.grammrfix', '.env'), // Home directory
    path.join(app.getAppPath(), '.env'), // App package directory
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      require('dotenv').config({ path: envPath });
      console.log('Loaded .env from:', envPath);
      return envPath;
    }
  }

  // If no .env found, try default location
  try {
    require('dotenv').config();
  } catch (error) {
    console.warn('No .env file found. Please create one with GEMINI_API_KEY');
  }
}

loadEnvFile();

// Load native text bridge module
let textBridge = null;
try {
  textBridge = require('./native/textBridge');
} catch (error) {
  console.warn('Native text bridge not available, using fallback methods:', error.message);
  // textBridge will be null, and we'll use fallback methods
}

let mainWindow = null;
let tray = null;
let popupWindow = null;
let statusOverlay = null;
let soundEnabled = true;

// Undo stack for text corrections
const undoStack = [];
const MAX_UNDO_ITEMS = 10;

function createWindow() {
  // Try to load app icon
  const iconPaths = [
    path.join(__dirname, 'assets', 'icons', 'snapfix_logo-onboarding.png'),
    // path.join(__dirname, 'snapfix_logo.png'),
    // path.join(__dirname, 'snapfix-logo.png'),
    // path.join(__dirname, 'snapfix-icon.png'),
  ];
  
  let appIcon = null;
  for (const iconPath of iconPaths) {
    try {
      if (fs.existsSync(iconPath)) {
        appIcon = nativeImage.createFromPath(iconPath);
        if (!appIcon.isEmpty()) {
          console.log('Loaded app icon from:', iconPath);
          break;
        }
      }
    } catch (e) {
      continue;
    }
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    icon: appIcon && !appIcon.isEmpty() ? appIcon : undefined, // Set window icon
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    }
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
  
  mainWindow.loadFile('index.html');

  // Register keyboard shortcuts for reload
  globalShortcut.register('CommandOrControl+R', () => {
    if (mainWindow) {
      mainWindow.reload();
    }
  });

  // Register F5 for reload (Windows/Linux style)
  globalShortcut.register('F5', () => {
    if (mainWindow) {
      mainWindow.reload();
    }
  });
}

function checkAccessibilityPermissions() {
  if (process.platform !== 'darwin') {
    return true; // Not needed on non-macOS platforms
  }

  // Try to simulate a keyboard event to test permissions
  // This will trigger a permission request if not already granted
  return new Promise((resolve) => {
    // Use a harmless key combination that won't interfere
    exec('osascript -e \'tell application "System Events" to keystroke " " using command down\'', (error) => {
      // If there's an error, it might be a permission issue
      // But we'll resolve as false only if it's clearly a permission error
      if (error && error.message && error.message.includes('not allowed')) {
        resolve(false);
      } else {
        // If no error or different error, assume permissions might be available
        // The actual test will happen when we try to use it
        resolve(error === null);
      }
    });
  });
}

function triggerPermissionRequest() {
  if (process.platform !== 'darwin') {
    return;
  }

  // Try multiple ways to trigger a permission request
  // This should cause macOS to show the app in Accessibility settings
  // The app might appear as "Electron", "node", or "Terminal" depending on how it's run
  
  // Method 1: Try to get process list (requires accessibility)
  exec('osascript -e \'tell application "System Events" to get name of every process\'', (error) => {
    if (error) {
      console.log('Permission request method 1:', error.message);
    }
  });
  
  // Method 2: Try to simulate a harmless keypress
  setTimeout(() => {
    exec('osascript -e \'tell application "System Events" to keystroke " " using command down\'', (error) => {
      if (error) {
        console.log('Permission request method 2:', error.message);
      }
    });
  }, 500);
}

function openAccessibilitySettings() {
  if (process.platform === 'darwin') {
    // Try to open macOS System Settings directly to Accessibility section
    const macOSVersion = parseFloat(os.release());
    
    if (macOSVersion >= 22.0) {
      // macOS Ventura (13.0)+ - use new System Settings URL
      exec('open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"', (error) => {
        if (error) {
          // Fallback: open System Settings
          exec('open "x-apple.systempreferences:"', () => {});
        }
      });
    } else {
      // macOS Monterey and earlier - use System Preferences
      exec('open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"', (error) => {
        if (error) {
          // Fallback: open Security & Privacy pane
          exec('open /System/Library/PreferencePanes/Security.prefPane', () => {});
        }
      });
    }
    
    // Show notification with instructions
    setTimeout(() => {
      showNotification(
        'SnapFix',
        'Please enable SnapFix in System Settings > Privacy & Security > Accessibility'
      );
    }, 500);
  }
}

function createTray() {
  // Create a simple tray icon
  // Try multiple icon paths (PNG works better for tray icons than .icns)
  // On macOS, tray icons should be PNG files, preferably 16x16 or 22x22 for retina
  const iconPaths = [
    path.join(__dirname, 'assets', 'icons', 'snapfix_tray_light.png'),
    path.join(__dirname, 'snapfix_logo.png'),
    path.join(__dirname, 'snapfix-logo.png'),
    path.join(__dirname, 'snapfix-icon.png'),
    path.join(__dirname, 'assets', 'icons', 'snapfix_logo.icns'),
    path.join(__dirname, 'icon.png'),
  ];
  
  let trayIcon = null;
  
  // Try each icon path until one works
  for (const iconPath of iconPaths) {
    try {
      if (fs.existsSync(iconPath)) {
        trayIcon = nativeImage.createFromPath(iconPath);
        if (!trayIcon.isEmpty()) {
          console.log('Loaded tray icon from:', iconPath);
          const originalSize = trayIcon.getSize();
          console.log('Original icon size:', originalSize.width, 'x', originalSize.height);
          
          // Resize to appropriate size for tray (22x22 for retina, 16x16 for standard)
          // macOS tray icons work best at these sizes
          if (originalSize.width > 16 || originalSize.height > 16) {
            trayIcon = trayIcon.resize({ width: 16, height: 16 });
            console.log('Resized tray icon to 16x16');
          }
          break;
        } else {
          console.warn('Icon file exists but is empty:', iconPath);
        }
      } else {
        console.log('Icon file not found:', iconPath);
      }
    } catch (e) {
      console.error('Error loading icon from', iconPath, ':', e.message);
      // Try next path
      continue;
    }
  }
  
  // If no icon loaded, create a simple template image
  if (!trayIcon || trayIcon.isEmpty()) {
    console.error('No tray icon found! Creating fallback icon');
    // Create a simple 16x16 monochrome icon for macOS tray
    // This is a minimal fallback - you should add a proper icon file
    try {
      // Try to create a simple template image
      const size = 16;
      const image = nativeImage.createEmpty();
      // For macOS, we need a template image (monochrome)
      // Since we can't easily create one programmatically without canvas,
      // we'll just use an empty icon and log a warning
      trayIcon = nativeImage.createEmpty();
      console.error('Using empty tray icon - tray will not be visible!');
      console.error('Please ensure snapfix_tray_light.png exists in assets/icons/');
    } catch (e) {
      trayIcon = nativeImage.createEmpty();
    }
  }
  
  // On macOS, DON'T set template image if the icon is colored
  // Template images should be monochrome (black/white)
  // Only set template if you have a monochrome icon
  // For now, we'll skip setTemplateImage to see if the icon shows
  // if (process.platform === 'darwin' && trayIcon && !trayIcon.isEmpty()) {
  //   try {
  //     trayIcon.setTemplateImage(true);
  //   } catch (e) {
  //     console.warn('Could not set template image:', e.message);
  //   }
  // }

  try {
    tray = new Tray(trayIcon);
    console.log('Tray created successfully');
    
    // Make sure tray is visible
    if (tray) {
      tray.setToolTip('SnapFix - Press Alt+Space to fix grammar');
      console.log('Tray tooltip set');
    }
  } catch (e) {
    console.error('Failed to create tray:', e.message);
    console.error('Error details:', e);
  }
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      }
    },
    {
      label: 'Fix Grammar (Global)',
      click: () => {
        handleGlobalFix();
      }
    },
    {
      label: 'Undo Last Correction',
      click: () => {
        handleUndo();
      },
      enabled: undoStack.length > 0
    },
    { type: 'separator' },
    ...(process.platform === 'darwin' ? [{
      label: 'Grant Accessibility Permissions',
      click: () => {
        // Trigger permission request first
        triggerPermissionRequest();
        // Then open settings
        openAccessibilitySettings();
        showNotification(
          'SnapFix',
          'Look for "Electron", "node", or "Terminal" in the list. If you don\'t see it, try using the shortcut (Alt+Space) first to trigger a permission request.'
        );
      }
    }, { type: 'separator' }] : []),
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('SnapFix - Press Alt+Space to fix grammar');
  tray.setContextMenu(contextMenu);

  // Double click to show window
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
}

async function handleGlobalFix() {
  try {
    // Hide main window if it's visible to prevent window switching
    if (mainWindow && mainWindow.isVisible()) {
      mainWindow.hide();
    }

    // Check accessibility permissions first
    let hasPermissions = false;
    if (textBridge) {
      try {
        hasPermissions = await textBridge.hasAccessibilityPermissions();
      } catch (error) {
        console.error('Error checking permissions:', error);
      }
    }

    // If permissions are missing, show status and dialog
    if (!hasPermissions && process.platform === 'darwin') {
      showStatusOverlay('error', 'Permissions needed');
      
      // Small delay before showing dialog to let overlay appear
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await dialog.showMessageBox({
        type: 'warning',
        title: 'Accessibility Permissions Required',
        message: 'SnapFix needs accessibility permissions to replace text in applications.',
        detail: 'Please grant accessibility permissions in System Settings > Privacy & Security > Accessibility.',
        buttons: ['Open System Settings', 'Cancel'],
        defaultId: 0,
        cancelId: 1
      });

      hideStatusOverlay();

      if (result.response === 0) {
        openAccessibilitySettings();
      }
      return;
    }

    // Get selected text using native bridge or fallback
    let textToFix = '';
    if (textBridge) {
      try {
        textToFix = await textBridge.getSelectedText();
      } catch (error) {
        console.error('Error getting selected text:', error);
        textToFix = '';
      }
    }

    // Fallback: Use clipboard method if native method returns empty or fails
    if (!textToFix || textToFix.trim().length === 0) {
      const originalClipboard = clipboard.readText();
      if (originalClipboard && originalClipboard.trim().length > 0) {
        textToFix = originalClipboard;
      } else {
        showStatusOverlay('error', 'No text selected');
        setTimeout(() => hideStatusOverlay(), 2000);
        return;
      }
    }

    if (!textToFix || textToFix.trim().length === 0) {
      showStatusOverlay('error', 'No text found');
      setTimeout(() => hideStatusOverlay(), 2000);
      return;
    }

    // Show processing status overlay
    showStatusOverlay('processing', 'Fixing typos...');

    // Process text in background - call Gemini API
    // NOTE: This function calls the existing Gemini API integration
    try {
      const correctedText = await processTextInBackground(textToFix);
      
      if (correctedText && correctedText.trim()) {
        if (correctedText !== textToFix) {
          // Text was corrected - replace it in place using native bridge
          let replaceSuccess = false;
          
          if (textBridge) {
            try {
              replaceSuccess = await textBridge.replaceSelectedText(correctedText);
            } catch (error) {
              console.error('Error replacing selected text:', error);
            }
          }

          // If native replacement failed, fall back to clipboard method
          if (!replaceSuccess) {
            // Fallback: Use clipboard and keyboard simulation
            clipboard.writeText(correctedText);
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (process.platform === 'darwin') {
              try {
                await execAsync('osascript -e \'tell application "System Events" to keystroke "v" using command down\'');
                replaceSuccess = true;
              } catch (error) {
                console.error('Fallback paste failed:', error);
              }
            } else if (process.platform === 'win32') {
              try {
                await execAsync('powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'^v\')"');
                replaceSuccess = true;
              } catch (error) {
                console.error('Fallback paste failed:', error);
              }
            }
          }

          if (replaceSuccess) {
            // Store in undo stack
            undoStack.push({
              originalText: textToFix,
              correctedText: correctedText,
              timestamp: Date.now()
            });
            
            // Keep only last MAX_UNDO_ITEMS
            if (undoStack.length > MAX_UNDO_ITEMS) {
              undoStack.shift();
            }
            
            // Update status to success
            showStatusOverlay('success', 'Text fixed!');
          } else {
            // If replacement failed, at least clipboard has the corrected text
            showStatusOverlay('error', 'Paste manually');
          }
        } else {
          showStatusOverlay('success', 'No changes needed');
        }
      } else {
        showStatusOverlay('error', 'Could not process');
      }
    } catch (error) {
      console.error('Error processing text:', error);
      const errorMessage = error.message.length > 25 ? error.message.substring(0, 25) + '...' : error.message;
      showStatusOverlay('error', errorMessage);
    }

  } catch (error) {
    console.error('Error in handleGlobalFix:', error);
    showStatusOverlay('error', 'Failed to process');
  }
}

async function simulateCopy() {
  try {
    if (process.platform === 'darwin') {
      // macOS: Use AppleScript to simulate Cmd+C
      // This will trigger a permission request if not granted
      await execAsync(`osascript -e 'tell application "System Events" to keystroke "c" using command down'`);
    } else if (process.platform === 'win32') {
      // Windows: Use PowerShell to simulate Ctrl+C
      await execAsync(`powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^c')"`);
    } else {
      // Linux: Use xdotool if available
      try {
        await execAsync('xdotool key ctrl+c');
      } catch (e) {
        // xdotool not available, skip copy simulation
        console.log('xdotool not available, skipping copy simulation');
      }
    }
  } catch (error) {
    console.error('Error simulating copy:', error);
    // Check if it's a permission error on macOS
    if (process.platform === 'darwin') {
      const errorMsg = error.message || error.stderr || '';
      if (errorMsg.includes('not allowed') || errorMsg.includes('not allowed assistive')) {
        showNotification(
          'SnapFix',
          'Accessibility permissions needed! A system dialog should appear. If not, go to System Settings > Privacy & Security > Accessibility and look for "Electron" or "node"'
        );
        // Try to trigger the permission request
        triggerPermissionRequest();
      }
    }
    // Fallback: if simulation fails, we'll just use clipboard
  }
}

async function simulatePaste() {
  try {
    if (process.platform === 'darwin') {
      // macOS: Use AppleScript to simulate Cmd+V
      await execAsync(`osascript -e 'tell application "System Events" to keystroke "v" using command down'`);
    } else if (process.platform === 'win32') {
      // Windows: Use PowerShell to simulate Ctrl+V
      await execAsync(`powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')"`);
    } else {
      // Linux: Use xdotool if available
      try {
        await execAsync('xdotool key ctrl+v');
      } catch (e) {
        // xdotool not available, show notification
        showNotification('SnapFix', 'Text fixed! Please paste manually (Ctrl+V). Install xdotool for auto-paste.');
      }
    }
  } catch (error) {
    console.error('Error simulating paste:', error);
    // Check if it's a permission error on macOS
    if (process.platform === 'darwin' && error.message && error.message.includes('not allowed')) {
      showNotification(
        'SnapFix',
        'Accessibility permissions required! Text is in clipboard. Click tray icon > Grant Accessibility Permissions'
      );
    } else {
      // If paste simulation fails, at least clipboard has the corrected text
      showNotification('SnapFix', 'Text fixed! Please paste manually (Cmd+V / Ctrl+V)');
    }
  }
}

async function handleUndo() {
  try {
    if (undoStack.length === 0) {
      showStatusOverlay('error', 'No corrections to undo');
      setTimeout(() => hideStatusOverlay(), 2000);
      return;
    }

    showStatusOverlay('processing', 'Undoing...');

    const lastCorrection = undoStack.pop();
    
    // Replace the corrected text with the original text
    let undoSuccess = false;
    
    if (textBridge) {
      try {
        undoSuccess = await textBridge.replaceSelectedText(lastCorrection.originalText);
      } catch (error) {
        console.error('Error undoing text:', error);
      }
    }

    // If native replacement failed, fall back to clipboard method
    if (!undoSuccess) {
      clipboard.writeText(lastCorrection.originalText);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (process.platform === 'darwin') {
        try {
          await execAsync('osascript -e \'tell application "System Events" to keystroke "v" using command down\'');
          undoSuccess = true;
        } catch (error) {
          console.error('Fallback undo paste failed:', error);
        }
      } else if (process.platform === 'win32') {
        try {
          await execAsync('powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'^v\')"');
          undoSuccess = true;
        } catch (error) {
          console.error('Fallback undo paste failed:', error);
        }
      }
    }

    if (undoSuccess) {
      showStatusOverlay('success', 'Undone!');
    } else {
      showStatusOverlay('error', 'Undo failed');
    }
  } catch (error) {
    console.error('Error in handleUndo:', error);
    showStatusOverlay('error', 'Error undoing');
  }
}

async function processTextInBackground(text) {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  // Call the Gemini API directly from main process
  return await callGeminiAPI(text, apiKey);
}

async function callGeminiAPI(text, apiKey) {
  const prompt = `Fix spelling only. Keep wording/structure. Return corrected text:\n\n${text}`;

  const modelConfigs = [
    { version: 'v1beta', model: 'gemini-2.5-flash-lite' },
    { version: 'v1beta', model: 'gemini-3-pro-preview' },
    { version: 'v1beta', model: 'gemini-2.5-flash' },
    { version: 'v1beta', model: 'gemini-1.5-flash' },
  ];

  const REQUEST_TIMEOUT = 6000;
  let lastError = null;

  for (const config of modelConfigs) {
    try {
      const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${apiKey}`;
      
      let timeoutId = null;
      try {
        const estimatedOutputTokens = Math.ceil(text.length * 1.1 / 4);
        const maxTokens = Math.min(Math.max(estimatedOutputTokens, 50), 512);

        // Use node-fetch for HTTP requests in Node.js
        const fetch = require('node-fetch');
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error(`Request timeout after ${REQUEST_TIMEOUT / 1000}s`));
          }, REQUEST_TIMEOUT);
        });

        // Race between fetch and timeout
        const response = await Promise.race([
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0,
                maxOutputTokens: maxTokens,
                topP: 0.7,
                topK: 10,
              },
            }),
          }),
          timeoutPromise
        ]);

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          lastError = new Error(
            errorData.error?.message ||
              `API request failed with status ${response.status}`
          );
          continue;
        }

        const data = await response.json();

        if (
          !data.candidates ||
          !data.candidates[0] ||
          !data.candidates[0].content ||
          !data.candidates[0].content.parts ||
          !data.candidates[0].content.parts[0]
        ) {
          lastError = new Error('Unexpected response format from API');
          continue;
        }

        return data.candidates[0].content.parts[0].text.trim();
      } catch (fetchError) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Handle network errors and timeouts
        if (fetchError.code === 'ENOTFOUND' || 
            fetchError.code === 'EAI_AGAIN' || 
            fetchError.code === 'ETIMEDOUT' || 
            fetchError.message.includes('timeout') ||
            fetchError.message.includes('network')) {
          lastError = new Error('Network error');
        } else {
          lastError = fetchError;
        }
        continue;
      }
    } catch (error) {
      lastError = error;
      continue;
    }
  }

  throw lastError || new Error('Failed to call Gemini API');
}

function createStatusOverlay() {
  if (statusOverlay && !statusOverlay.isDestroyed()) return;

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;
  const workArea = primaryDisplay.workArea;

  // Calculate Y position to extend from notch/menu bar
  let overlayY = -10;
  let overlayHeight = 56;
  let overlayWidth = 400;
  
  if (process.platform === 'darwin') {
    if (workArea.y > 0) {
      overlayY = -10; // Force up slightly to cover hairline gap
      overlayHeight = workArea.y + 46; // Increase height to compensate
      overlayWidth = 260;
    } else {
      overlayY = -10;
      overlayHeight = 50;
      overlayWidth = 280;
    }
  } else {
    overlayY = -10;
    overlayHeight = 56;
    overlayWidth = 280;
  }

  statusOverlay = new BrowserWindow({
    width: overlayWidth,
    height: overlayHeight,
    x: Math.round((width - overlayWidth) / 2),
    y: overlayY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: false,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false
    },
    show: false,
    acceptFirstMouse: true,
    ...(process.platform === 'darwin' && {
      vibrancy: 'ultra-dark',
      visualEffectState: 'active',
      // titleBarStyle: 'hidden', // Removed to prevent potential layout shift
      backgroundColor: '#00000000',
      roundedCorners: false,
      opacity: 1.0
    })
  });

  statusOverlay.loadFile('statusOverlay.html');
  
  statusOverlay.webContents.once('did-finish-load', () => {
    // Load ICNS icon and send to renderer
    const iconPath = path.join(__dirname, 'assets/icons/snapfix_logo_onboarding.png');
    if (fs.existsSync(iconPath)) {
      const image = nativeImage.createFromPath(iconPath);
      if (!image.isEmpty()) {
        const dataUrl = image.toDataURL();
        statusOverlay.webContents.send('set-icon', dataUrl);
      }
    }
  });
  
  statusOverlay.on('closed', () => {
    statusOverlay = null;
  });
}

function showStatusOverlay(type, message) {
  if (!statusOverlay || statusOverlay.isDestroyed()) {
    createStatusOverlay();
  }

  if (statusOverlay && !statusOverlay.isDestroyed()) {
    // Ensure window is visible immediately
    if (process.platform === 'darwin') {
      statusOverlay.showInactive();
    } else {
      statusOverlay.show();
    }
    statusOverlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    statusOverlay.setAlwaysOnTop(true, 'screen-saver'); // Ensure it's on top of full screen apps

    // Send update
    statusOverlay.webContents.send('status-update', { type, message, soundEnabled });

    // Ensure icon is set (resend to be safe)
    const iconPath = path.join(__dirname, 'assets/icons/snapfix_logo_onboarding.png');
    if (fs.existsSync(iconPath)) {
      const image = nativeImage.createFromPath(iconPath);
      if (!image.isEmpty()) {
        statusOverlay.webContents.send('set-icon', image.toDataURL());
      }
    }
  }
}

function hideStatusOverlay() {
  if (statusOverlay && !statusOverlay.isDestroyed()) {
    try {
      if (statusOverlay.webContents && !statusOverlay.webContents.isDestroyed()) {
        statusOverlay.webContents.send('close-overlay');
      } else {
        statusOverlay.hide();
      }
    } catch (error) {
      console.error('Error hiding overlay:', error);
      try {
        statusOverlay.hide();
      } catch (e) {
        // Ignore
      }
    }
  }
}

function showNotification(title, body) {
  // Fallback: Use system notification for errors or when overlay is not suitable
  // For status updates, use showStatusOverlay instead
  if (Notification.isSupported()) {
    new Notification({ title, body, silent: true }).show();
  } else {
    console.log(`${title}: ${body}`);
  }
}

// Handle API key request from renderer
ipcMain.handle('get-api-key', () => {
  return process.env.GEMINI_API_KEY || '';
});

// Handle saving API key
ipcMain.handle('save-api-key', async (event, apiKey) => {
  if (!apiKey || apiKey.trim().length === 0) {
    return { success: false, error: 'API key cannot be empty' };
  }

  try {
    // Save to user data directory (most reliable location)
    const userDataPath = app.getPath('userData');
    const envPath = path.join(userDataPath, '.env');
    
    // Create .env file with the API key
    const envContent = `GEMINI_API_KEY=${apiKey.trim()}\n`;
    fs.writeFileSync(envPath, envContent, 'utf8');
    
    // Reload environment variables
    require('dotenv').config({ path: envPath });
    process.env.GEMINI_API_KEY = apiKey.trim();
    
    console.log('API key saved to:', envPath);
    return { success: true };
  } catch (error) {
    console.error('Error saving API key:', error);
    return { success: false, error: error.message };
  }
});

// Handle text processing request
ipcMain.handle('process-text', async (event, text) => {
  return text; // Return text to be processed in renderer
});

// Handle analytics tracking from renderer
ipcMain.handle('analytics-track', async (event, eventName, properties = {}) => {
  analytics.track(eventName, properties);
});

// Handle analytics identify from renderer
ipcMain.handle('analytics-identify', async (event, userProperties = {}) => {
  analytics.identify(userProperties);
});

// Handle opening system settings
ipcMain.handle('open-system-settings', async () => {
  openAccessibilitySettings();
  return true;
});

// Handle opening external links
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

// Handle setting clipboard with corrected text (for popup window if needed)
ipcMain.handle('set-clipboard', (event, text) => {
  clipboard.writeText(text);
  return true;
});

// Handle closing popup
ipcMain.handle('close-popup', () => {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.close(); // Close instead of hide for proper cleanup
    popupWindow = null;
  }
  return true;
});

// Handle closing main window (for onboarding completion)
ipcMain.handle('close-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }
  return true;
});

// Handle making window focusable when user interacts
ipcMain.handle('make-window-focusable', () => {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.setFocusable(true);
    popupWindow.focus();
    return true;
  }
  return false;
});

// Handle getting current shortcut
ipcMain.handle('get-shortcut', () => {
  return currentShortcut;
});

// Handle setting new shortcut
ipcMain.handle('set-shortcut', (event, shortcut) => {
  if (!shortcut) return { success: false, error: 'Invalid shortcut' };
  
  // Register new shortcut
  const success = registerFixShortcut(shortcut);
  
  if (success) {
    saveConfig({ shortcut });
    
    // Update tray tooltip
    if (tray && !tray.isDestroyed()) {
      tray.setToolTip(`SnapFix - Press ${shortcut} to fix grammar`);
    }
    
    return { success: true };
  } else {
    // Revert to old shortcut if failed
    registerFixShortcut(currentShortcut);
    return { success: false, error: 'Failed to register shortcut' };
  }
});

// Handle sound settings
ipcMain.handle('get-sound-enabled', () => {
  return soundEnabled;
});

ipcMain.handle('set-sound-enabled', (event, enabled) => {
  soundEnabled = enabled;
  saveConfig({ soundEnabled: enabled });
  return true;
});

// Handle start at login
ipcMain.handle('get-start-at-login', () => {
  try {
    return app.getLoginItemSettings().openAtLogin;
  } catch (e) {
    console.error('Error getting login settings:', e);
    return false;
  }
});

ipcMain.handle('set-start-at-login', (event, enabled) => {
  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: app.getPath('exe')
    });
    return true;
  } catch (e) {
    console.error('Error setting login settings:', e);
    return false;
  }
});

// Handle app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Handle quit app
ipcMain.handle('quit-app', () => {
  app.quit();
});

// Handle confirmation dialog
ipcMain.handle('show-confirm-dialog', async (event, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  
  // Resolve icon path more robustly
  // In production (asar), __dirname is inside the archive.
  // But dialog icon often expects an unpacked path or native image.
  const iconPath = path.join(__dirname, 'assets', 'icons', 'snapfix_logo_onboarding.png');
  let iconImage = null;
  
  try {
    if (fs.existsSync(iconPath)) {
      iconImage = nativeImage.createFromPath(iconPath);
    }
  } catch (e) {
    // If loading fails, iconImage remains null
  }

  const result = await dialog.showMessageBox(win, {
    type: 'question',
    buttons: ['Cancel', 'OK'],
    defaultId: 1,
    cancelId: 0,
    title: options.title || 'SnapFix',
    message: options.message,
    detail: options.detail,
    icon: iconImage || undefined
  });
  return result.response === 1;
});

// Handle status overlay close message
ipcMain.on('status-overlay-close', () => {
  if (statusOverlay && !statusOverlay.isDestroyed()) {
    statusOverlay.hide();
  }
});

// Set app name for better identification in System Settings
app.setName('SnapFix');

app.whenReady().then(async () => {
  // On macOS, use accessory activation policy to prevent app activation
  // This allows the app to show windows without activating and switching apps
  if (process.platform === 'darwin') {
    try {
      // Set activation policy to accessory (doesn't appear in dock, doesn't activate)
      app.setActivationPolicy('accessory');
    } catch (e) {
      // Fallback if setActivationPolicy fails
      console.log('Could not set activation policy:', e);
    }
  }

  // Initialize UI immediately
  createWindow();
  createTray();
  createStatusOverlay(); // Pre-create hidden overlay
  
  // Load config
  loadConfig();

  // Check if API key is configured (proxy for onboarding completion)
  const hasApiKey = !!process.env.GEMINI_API_KEY;

  if (mainWindow) {
    if (hasApiKey) {
      console.log('API key found, starting in background');
      mainWindow.hide();
    } else {
      console.log('No API key found, showing onboarding');
      // Ensure window is visible and focused for onboarding
      mainWindow.show();
      mainWindow.focus();
    }
  }

  // Check accessibility permissions using native bridge
  if (process.platform === 'darwin') {
    if (textBridge) {
      try {
        const hasPermissions = await textBridge.hasAccessibilityPermissions();
        if (!hasPermissions) {
          // Permissions will be checked when user tries to use the shortcut
          // No need to show overlay on startup
        }
      } catch (error) {
        console.error('Error checking permissions on startup:', error);
      }
    } else {
      // Fallback: Trigger permission request using old method
      // Don't await here to avoid blocking startup
      checkAccessibilityPermissions().then(hasPermissions => {
        if (!hasPermissions) {
          // Optional: notify user, but maybe too intrusive on startup
        }
      });
    }
  }

  // Register global shortcut for grammar fix
  registerFixShortcut(currentShortcut);

  // Hide window on close (keep app running in tray)
  if (mainWindow) {
    mainWindow.on('close', (event) => {
      if (!app.isQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('window-all-closed', (event) => {
  // Don't quit on macOS - keep running in tray
  if (process.platform !== 'darwin') {
    globalShortcut.unregisterAll();
    app.quit();
  } else {
    // On macOS, prevent quitting when all windows are closed
    event.preventDefault();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
  // Clear undo stack
  undoStack.length = 0;
  // Close status overlay if open
  if (statusOverlay && !statusOverlay.isDestroyed()) {
    statusOverlay.close();
  }
});
