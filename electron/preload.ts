import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Store API for persistence (replaces localStorage)
    store: {
        get: (key: string) => ipcRenderer.invoke('store:get', key),
        set: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
        delete: (key: string) => ipcRenderer.invoke('store:delete', key),
        clear: () => ipcRenderer.invoke('store:clear'),
    },

    // App info
    getVersion: () => ipcRenderer.invoke('app:getVersion'),

    // Window controls (if using custom titlebar)
    window: {
        minimize: () => ipcRenderer.send('window:minimize'),
        maximize: () => ipcRenderer.send('window:maximize'),
        close: () => ipcRenderer.send('window:close'),
    },

    // Steam API (placeholder for now)
    steam: {
        isAvailable: () => false, // Will implement later with Greenworks
        unlockAchievement: (achievementId: string) => {
            console.log('Steam achievement placeholder:', achievementId);
            return Promise.resolve(false);
        },
    },
});

// Type declarations for TypeScript
export interface ElectronAPI {
    store: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<boolean>;
        delete: (key: string) => Promise<boolean>;
        clear: () => Promise<boolean>;
    };
    getVersion: () => Promise<string>;
    window: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
    };
    steam: {
        isAvailable: () => boolean;
        unlockAchievement: (achievementId: string) => Promise<boolean>;
    };
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
