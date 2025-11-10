const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  setClipboard: (text) => ipcRenderer.invoke('set-clipboard', text),
  closePopup: () => ipcRenderer.invoke('close-popup'),
  makeWindowFocusable: () => ipcRenderer.invoke('make-window-focusable'),
  onProcessText: (callback) => {
    // Remove all existing listeners to avoid duplicates
    ipcRenderer.removeAllListeners('process-text');
    ipcRenderer.on('process-text', (event, text) => {
      callback(text);
    });
  }
});

