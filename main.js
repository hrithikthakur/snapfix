const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, clipboard, nativeImage } = require('electron');
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
    // Get text from clipboard
    const clipboardText = clipboard.readText();
    
    if (!clipboardText || clipboardText.trim().length === 0) {
      // Try to copy selected text by simulating Cmd+C / Ctrl+C
      // Note: This might not work on all apps, but it's the best we can do
      showNotification('No text found', 'Please copy text to clipboard or select text and try again');
      return;
    }

    // Show popup window for processing
    if (!popupWindow) {
      popupWindow = new BrowserWindow({
        width: 500,
        height: 300,
        frame: true,
        alwaysOnTop: true,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          preload: path.join(__dirname, 'preload.js')
        }
      });
    }

    popupWindow.loadFile('popup.html');
    popupWindow.show();
    popupWindow.focus();

    // Send text to popup window for processing
    popupWindow.webContents.once('did-finish-load', () => {
      popupWindow.webContents.send('process-text', clipboardText);
    });

  } catch (error) {
    console.error('Error in handleGlobalFix:', error);
    showNotification('Error', 'Failed to process text: ' + error.message);
  }
}

function showNotification(title, body) {
  // Simple notification (works on macOS, Windows, Linux)
  if (process.platform === 'darwin') {
    // macOS notification
    const { Notification } = require('electron');
    new Notification({ title, body }).show();
  } else {
    // For other platforms, we could show a dialog or use a notification library
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

app.whenReady().then(() => {
  createWindow();
  createTray();

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
