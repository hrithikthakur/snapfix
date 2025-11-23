const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  saveApiKey: (apiKey) => ipcRenderer.invoke('save-api-key', apiKey),
  setClipboard: (text) => ipcRenderer.invoke('set-clipboard', text),
  closePopup: () => ipcRenderer.invoke('close-popup'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  makeWindowFocusable: () => ipcRenderer.invoke('make-window-focusable'),
  onProcessText: (callback) => {
    // Remove all existing listeners to avoid duplicates
    ipcRenderer.removeAllListeners('process-text');
    ipcRenderer.on('process-text', (event, text) => {
      callback(text);
    });
  },
  // Analytics API
  trackEvent: (eventName, properties) => ipcRenderer.invoke('analytics-track', eventName, properties),
  identifyUser: (userProperties) => ipcRenderer.invoke('analytics-identify', userProperties),
  // System settings
  openSystemSettings: () => ipcRenderer.invoke('open-system-settings'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  // Shortcut settings
  getShortcut: () => ipcRenderer.invoke('get-shortcut'),
  setShortcut: (shortcut) => ipcRenderer.invoke('set-shortcut', shortcut),
  // Other settings
  getSoundEnabled: () => ipcRenderer.invoke('get-sound-enabled'),
  setSoundEnabled: (enabled) => ipcRenderer.invoke('set-sound-enabled', enabled),
  getStartAtLogin: () => ipcRenderer.invoke('get-start-at-login'),
  setStartAtLogin: (enabled) => ipcRenderer.invoke('set-start-at-login', enabled),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  showConfirmDialog: (options) => ipcRenderer.invoke('show-confirm-dialog', options)
});

