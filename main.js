const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, clipboard, nativeImage, Notification, screen, dialog } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const analytics = require('./analytics');

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

// Undo stack for text corrections
const undoStack = [];
const MAX_UNDO_ITEMS = 10;

function createWindow() {
  // Try to load app icon
  const iconPaths = [
    path.join(__dirname, 'assets', 'icons', 'snapfix_logo.png'),
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
    width: 600,
    height: 500,
    icon: appIcon && !appIcon.isEmpty() ? appIcon : undefined, // Set window icon
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
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
        'GrammrFix',
        'Please enable GrammrFix in System Settings > Privacy & Security > Accessibility'
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
      label: 'Show Window',
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
          'GrammrFix',
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

  tray.setToolTip('GrammrFix - Press Alt+Space to fix grammar');
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
        message: 'GrammrFix needs accessibility permissions to replace text in applications.',
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
          'GrammrFix',
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
        showNotification('GrammrFix', 'Text fixed! Please paste manually (Ctrl+V). Install xdotool for auto-paste.');
      }
    }
  } catch (error) {
    console.error('Error simulating paste:', error);
    // Check if it's a permission error on macOS
    if (process.platform === 'darwin' && error.message && error.message.includes('not allowed')) {
      showNotification(
        'GrammrFix',
        'Accessibility permissions required! Text is in clipboard. Click tray icon > Grant Accessibility Permissions'
      );
    } else {
      // If paste simulation fails, at least clipboard has the corrected text
      showNotification('GrammrFix', 'Text fixed! Please paste manually (Cmd+V / Ctrl+V)');
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
    { version: 'v1beta', model: 'gemini-2.5-flash' },
    { version: 'v1beta', model: 'gemini-1.5-flash' },
  ];

  const REQUEST_TIMEOUT = 6000;
  let lastError = null;

  for (const config of modelConfigs) {
    try {
      const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${apiKey}`;
      
      try {
        const estimatedOutputTokens = Math.ceil(text.length * 1.1 / 4);
        const maxTokens = Math.min(Math.max(estimatedOutputTokens, 50), 512);

        // Use node-fetch for HTTP requests in Node.js
        const fetch = require('node-fetch');
        
        // Create timeout promise
        let timeoutId = null;
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
        lastError = fetchError;
        continue;
      }
    } catch (error) {
      lastError = error;
      continue;
    }
  }

  throw lastError || new Error('Failed to call Gemini API');
}

function showStatusOverlay(type, message) {
  // If overlay exists and is ready, just update it
  if (statusOverlay && !statusOverlay.isDestroyed()) {
    try {
      // Check if webContents is ready
      if (statusOverlay.webContents && !statusOverlay.webContents.isDestroyed()) {
        statusOverlay.webContents.send('status-update', { type, message });
        return;
      }
    } catch (error) {
      // If send fails, close and recreate
      console.error('Error updating overlay:', error);
    }
  }

  // Get primary display bounds
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const workArea = primaryDisplay.workArea;

  // Close existing overlay if any
  if (statusOverlay && !statusOverlay.isDestroyed()) {
    statusOverlay.close();
  }

  // Calculate Y position below the notch/menu bar
  // workArea.y gives us the top of the safe area (below notch/menu bar on MacBooks)
  // On MacBooks with notch: workArea.y is typically 28-32px (height of menu bar + notch area)
  // On MacBooks without notch: workArea.y is typically 25-28px (height of menu bar)
  // Add a small margin below that (20px) to position the overlay nicely
  const topMargin = 20;
  let overlayY;
  
  if (process.platform === 'darwin') {
    // macOS: Position below the notch area
    // workArea.y is the top of the usable area (below menu bar/notch)
    if (workArea.y > 0) {
      // Has notch or menu bar offset - position below it
      overlayY = workArea.y + topMargin;
    } else {
      // Fallback: Use a safe default position (typically 50px covers menu bar + margin)
      overlayY = 50;
    }
  } else {
    // Windows/Linux: Use small margin from top
    overlayY = topMargin;
  }

  // Create status overlay window
  statusOverlay = new BrowserWindow({
    width: 280,
    height: 56,
    x: Math.round((width - 280) / 2), // Center horizontally
    y: overlayY, // Position below notch/menu bar
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: false,
    hasShadow: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false
    },
    show: false,
    acceptFirstMouse: true,
    // macOS specific options for better appearance
    ...(process.platform === 'darwin' && {
      vibrancy: 'ultra-dark',
      visualEffectState: 'active',
      titleBarStyle: 'hidden'
    })
  });

  // Load status overlay HTML
  statusOverlay.loadFile('statusOverlay.html');

  // Wait for DOM to be ready before sending status update and showing
  statusOverlay.webContents.once('did-finish-load', () => {
    // Send status update
    if (statusOverlay && !statusOverlay.isDestroyed()) {
      statusOverlay.webContents.send('status-update', { type, message });
      
      // Show window after a brief delay to ensure render
      setTimeout(() => {
        if (statusOverlay && !statusOverlay.isDestroyed()) {
          if (process.platform === 'darwin') {
            // macOS: Show without activating
            statusOverlay.showInactive();
          } else {
            statusOverlay.show();
          }
          statusOverlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        }
      }, 50);
    }
  });

  // Handle overlay close
  statusOverlay.on('closed', () => {
    statusOverlay = null;
  });
}

function hideStatusOverlay() {
  if (statusOverlay && !statusOverlay.isDestroyed()) {
    statusOverlay.webContents.send('close-overlay');
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

// Handle making window focusable when user interacts
ipcMain.handle('make-window-focusable', () => {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.setFocusable(true);
    popupWindow.focus();
    return true;
  }
  return false;
});

// Handle status overlay close message
ipcMain.on('status-overlay-close', () => {
  if (statusOverlay && !statusOverlay.isDestroyed()) {
    statusOverlay.close();
  }
});

// Set app name for better identification in System Settings
app.setName('GrammrFix');

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

    // Check accessibility permissions using native bridge
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
      triggerPermissionRequest();
      const hasPermissions = await checkAccessibilityPermissions();
      if (!hasPermissions) {
        setTimeout(() => {
          showNotification(
            'GrammrFix',
              'Accessibility permissions needed! Try using the shortcut (Alt+Space) - this will trigger a permission dialog.'
          );
        }, 2000);
      }
    }
  }

  createWindow();
  createTray();
  
  // Hide main window initially so it doesn't show when app starts
  if (mainWindow) {
    mainWindow.hide();
  }

  // Register global shortcut for grammar fix (Alt+Space)
  const ret = globalShortcut.register('Alt+Space', () => {
    handleGlobalFix();
  });

  if (!ret) {
    console.log('Global shortcut registration failed');
  } else {
    console.log('Global shortcut registered: Alt+Space');
  }

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
