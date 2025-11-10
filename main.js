const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, clipboard, nativeImage, Notification, screen } = require('electron');
const path = require('path');
require('dotenv').config();

let mainWindow = null;
let tray = null;
let popupWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
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

function createTray() {
  // Create a simple tray icon
  const iconPath = path.join(__dirname, 'icon.png');
  let trayIcon = null;
  
  try {
    // Try to load icon, if it doesn't exist, create a simple one
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      throw new Error('Icon not found');
    }
  } catch (e) {
    // Create a simple 16x16 icon programmatically
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon.isEmpty() ? nativeImage.createEmpty() : trayIcon);
  
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
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('GrammrFix - Press Cmd+Shift+G to fix grammar');
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

    // Get text from clipboard
    const clipboardText = clipboard.readText();
    
    if (!clipboardText || clipboardText.trim().length === 0) {
      // Try to copy selected text by simulating Cmd+C / Ctrl+C
      // Note: This might not work on all apps, but it's the best we can do
      showNotification('No text found', 'Please copy text to clipboard or select text and try again');
      return;
    }

    // Show popup window for processing
    if (popupWindow) {
      popupWindow.destroy();
    }

    // Get screen dimensions for centering
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    
    const popupWidth = 500;
    const popupHeight = 400;
    const x = Math.round((screenWidth - popupWidth) / 2);
    const y = Math.round((screenHeight - popupHeight) / 2);

    popupWindow = new BrowserWindow({
      width: popupWidth,
      height: popupHeight,
      x: x,
      y: y,
      frame: false, // Frameless for overlay feel
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true, // Don't show in task switcher
      focusable: true, // Must be focusable for interaction
      transparent: false,
      hasShadow: true,
      show: false, // Don't show immediately
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    popupWindow.loadFile('popup.html');
    
    // Show the popup as an overlay
    if (process.platform === 'darwin') {
      // macOS: use setVisibleOnAllWorkspaces and showInactive to prevent app activation
      popupWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      popupWindow.setSkipTaskbar(true);
      popupWindow.showInactive(); // Show without activating
    } else {
      // Windows/Linux: show normally
      popupWindow.show();
    }

    // Send text to popup window for processing after it's fully loaded
    // Use a small delay to ensure the listener is set up
    popupWindow.webContents.once('did-finish-load', () => {
      // Wait a bit for the DOM and event listeners to be ready
      setTimeout(() => {
        if (popupWindow && !popupWindow.isDestroyed()) {
          popupWindow.webContents.send('process-text', clipboardText);
        }
      }, 100);
    });

    // Clean up when window is closed
    popupWindow.on('closed', () => {
      popupWindow = null;
    });

  } catch (error) {
    console.error('Error in handleGlobalFix:', error);
    showNotification('Error', 'Failed to process text: ' + error.message);
  }
}

function showNotification(title, body) {
  // Simple notification (works on macOS, Windows, Linux)
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
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

// Handle setting clipboard with corrected text
ipcMain.handle('set-clipboard', (event, text) => {
  clipboard.writeText(text);
  return true;
});

// Handle closing popup
ipcMain.handle('close-popup', () => {
  if (popupWindow) {
    popupWindow.hide();
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

app.whenReady().then(() => {
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

  createWindow();
  createTray();
  
  // Hide main window initially so it doesn't show when app starts
  if (mainWindow) {
    mainWindow.hide();
  }

  // Register global shortcut for grammar fix (Cmd+Shift+G / Ctrl+Shift+G)
  const ret = globalShortcut.register('CommandOrControl+Shift+G', () => {
    handleGlobalFix();
  });

  if (!ret) {
    console.log('Global shortcut registration failed');
  } else {
    console.log('Global shortcut registered: Cmd+Shift+G / Ctrl+Shift+G');
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
});
