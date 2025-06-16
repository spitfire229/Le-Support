const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  handleCommand: (cb) => ipcRenderer.on('telecommande-command', cb)
});
