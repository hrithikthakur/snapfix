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
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});

