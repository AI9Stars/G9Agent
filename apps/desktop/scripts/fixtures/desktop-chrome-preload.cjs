// Keep production chrome in use; fixture-only controls travel over ordinary IPC.
require('../../dist/preload.js');
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('g9agentChromeFixture', {
  closeMenu: () => ipcRenderer.invoke('g9agent:chrome-close-menu'),
});
