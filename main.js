const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
require('dotenv').config();

let mainWindow = null;

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

// Handle API key request from renderer
ipcMain.handle('get-api-key', () => {
  return process.env.GEMINI_API_KEY || '';
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});
