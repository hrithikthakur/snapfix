const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  setClipboard: (text) => ipcRenderer.invoke('set-clipboard', text),
  closePopup: () => ipcRenderer.invoke('close-popup'),
  onProcessText: (callback) => {
    ipcRenderer.on('process-text', (event, text) => callback(text));
  }
});

