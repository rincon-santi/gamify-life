import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';

// ES module dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize electron-store for persistent data
const store = new Store();

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 960,
        minHeight: 540,
        title: 'The Hidden Covenant',
        backgroundColor: '#0a0a0a',
        autoHideMenuBar: true, // Hide the menu bar (File, Edit, View, etc.)
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    // Load the app
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

// App lifecycle
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers for persistent storage
ipcMain.handle('store:get', (_event, key: string) => {
    return store.get(key);
});

ipcMain.handle('store:set', (_event, key: string, value: any) => {
    store.set(key, value);
    return true;
});

ipcMain.handle('store:delete', (_event, key: string) => {
    store.delete(key);
    return true;
});

ipcMain.handle('store:clear', () => {
    store.clear();
    return true;
});

// Get app version for UI
ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
});

// Window controls (for custom titlebar if needed)
ipcMain.on('window:minimize', () => {
    mainWindow?.minimize();
});

ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});

ipcMain.on('window:close', () => {
    mainWindow?.close();
});

ipcMain.on('window:toggle-fullscreen', () => {
    if (mainWindow) {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
});
