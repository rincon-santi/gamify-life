"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Store API for persistence (replaces localStorage)
  store: {
    get: (key) => electron.ipcRenderer.invoke("store:get", key),
    set: (key, value) => electron.ipcRenderer.invoke("store:set", key, value),
    delete: (key) => electron.ipcRenderer.invoke("store:delete", key),
    clear: () => electron.ipcRenderer.invoke("store:clear")
  },
  // App info
  getVersion: () => electron.ipcRenderer.invoke("app:getVersion"),
  // Window controls (if using custom titlebar)
  window: {
    minimize: () => electron.ipcRenderer.send("window:minimize"),
    maximize: () => electron.ipcRenderer.send("window:maximize"),
    close: () => electron.ipcRenderer.send("window:close")
  },
  // Steam API (placeholder for now)
  steam: {
    isAvailable: () => false,
    // Will implement later with Greenworks
    unlockAchievement: (achievementId) => {
      console.log("Steam achievement placeholder:", achievementId);
      return Promise.resolve(false);
    }
  }
});
