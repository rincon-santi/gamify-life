import { app, BrowserWindow, ipcMain, shell, protocol, net, session } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';
import Store from 'electron-store';

// ES module dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize electron-store for persistent data
const store = new Store();

// Register custom protocol for secure local file access
protocol.registerSchemesAsPrivileged([
    { scheme: 'media', privileges: { secure: true, standard: true, supportFetchAPI: true, bypassCSP: true, stream: true, corsEnabled: true } }
]);

let mainWindow: BrowserWindow | null = null;

// Helper to find audio root
async function getAudioRoot(): Promise<string | null> {
    const appPath = app.getAppPath(); // Usually .../resources/app.asar

    // Priority 0: Unpacked ASAR (Production with asarUnpack)
    // If running from ASAR, check for parallel .unpacked folder
    if (appPath.endsWith('.asar')) {
        const unpackedPath = appPath + '.unpacked';
        const unpackedAudio = path.join(unpackedPath, 'dist', 'audio');
        try {
            if ((await fs.stat(unpackedAudio)).isDirectory()) {
                console.log('Found unpacked audio at:', unpackedAudio);
                return unpackedAudio;
            }
        } catch {
            // console.log('Unpacked audio not found at:', unpackedAudio);
        }
    }

    // Priority 1: Production (Standard / Fallback)
    const distPath = path.join(appPath, 'dist');
    try {
        const distFiles = await fs.readdir(distPath);
        if (distFiles.includes('audio')) {
            return path.join(distPath, 'audio');
        }
    } catch { }

    // Priority 2: Dev environment (Public folder)
    const devPath = path.join(appPath, 'public/audio');
    try {
        if ((await fs.stat(devPath)).isDirectory()) {
            return devPath;
        }
    } catch { }

    return null;
}

// Clean up temp audio files on exit
async function cleanupTempAudio() {
    const tempDir = path.join(app.getPath('temp'), 'gamify-life-audio');
    try {
        await fs.rm(tempDir, { recursive: true, force: true });
        // console.log('Cleaned up audio cache');
    } catch (e) {
        // console.error('Failed to cleanup audio cache:', e);
    }
}

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
            webSecurity: false, // Required for Spotify Embed to work in local/file protocol
            plugins: true, // Required for Widevine CDM (Spotify full tracks)
            webviewTag: true, // Required for <webview> tag
            autoplayPolicy: 'no-user-gesture-required', // Allow audio to autoplay on start
            // Use default session for better persistent cookie support
            // partition: 'persist:main_session'
        },
    });

    // Fake a standard Chrome user agent to help with Spotify's "unsupported browser" checks
    // Chrome 132 is used by Electron 34/35+ (Electron 39 is Chrome 132 or 134)
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36';
    mainWindow.webContents.setUserAgent(userAgent);

    // Permission handler for Widevine / Protected Media
    mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        // Automatically approve permission requests, especially for media
        if (permission === 'media' || permission === 'mediaKeySystem') {
            callback(true);
        } else {
            callback(true);
        }
    });

    // Load the app
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Always open DevTools for debugging audio issues in production
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

// App lifecycle
app.whenReady().then(() => {
    // Handle media:// protocol using native file serving (robust Range/ASAR support)
    protocol.registerFileProtocol('media', async (request, callback) => {
        try {
            // Manual parsing to avoid host/pathname confusion with custom schemes
            // request.url could be 'media://folder/file' or 'media:///folder/file'
            let relativePath = request.url.replace(/^media:\/*/, '');

            // Decode URI components
            relativePath = decodeURIComponent(relativePath);

            // Normalize slashes
            // relativePath = relativePath.replace(/\\/g, '/'); // ensure forward slashes if needed, but path.join handles OS specific

            // No need to strip leading slash if we used regex replacement correctly, 
            // but let's be safe against '///' -> 'folder/file' vs '//' -> 'folder/file'
            // The regex ^media:\/* eats all leading slashes/colons.

            const audioRoot = await getAudioRoot();
            if (!audioRoot) {
                console.error('Audio root not found');
                // callback({ statusCode: 404 }); // Type definition issues
                return;
            }

            const filePath = path.join(audioRoot, relativePath);

            // Native file protocol handles ASAR and Ranges automatically
            callback({ path: filePath });

        } catch (error) {
            console.error(`Failed to handle media request: ${request.url}`, error);
        }
    });

    // Spotify Authentication & Headers
    // Spotify requires a Referer header for its embed player to work in some contexts (like Electron).

    // Inject headers for Spotify Embed
    const spotifyFilter = {
        urls: ['*://*.spotify.com/*', '*://spotify.com/*']
    };

    // Use defaultSession (no partition)
    session.defaultSession.webRequest.onBeforeSendHeaders(spotifyFilter, (details, callback) => {
        details.requestHeaders['Referer'] = 'https://open.spotify.com/';
        callback({ requestHeaders: details.requestHeaders });
    });

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

app.on('will-quit', () => {
    cleanupTempAudio();
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

// Audio File System Access
ipcMain.handle('audio:get-playlists', async () => {
    const debugLog: string[] = [];
    try {
        const appPath = app.getAppPath();
        debugLog.push(`App Path: ${appPath}`);

        const audioRoot = await getAudioRoot();
        if (!audioRoot) {
            debugLog.push('x Audio folder not found via getAudioRoot()');
            return { playlists: [], debugInfo: debugLog };
        }

        debugLog.push(`✓ Resolved Audio Root: ${audioRoot}`);

        const entries = await fs.readdir(audioRoot, { withFileTypes: true });
        const playlists = [];
        let sanityCheckDone = false;

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const playlistPath = path.join(audioRoot, entry.name);
                const files = await fs.readdir(playlistPath);
                const tracks = files
                    .filter(f => /\.(mp3|wav|ogg|m4a)$/i.test(f))
                    .map(f => ({
                        name: f.replace(/\.[^/.]+$/, ""),
                        // Crucial: Used by protocol handler. 
                        // Must match the relative path structure expected by 'media://'
                        path: `media:///${entry.name}/${f}`
                    }));

                if (tracks.length > 0) {
                    playlists.push({ name: entry.name, tracks });

                    // Sanity Check
                    if (!sanityCheckDone) {
                        sanityCheckDone = true;
                        const filename = files.find(f => /\.(mp3|wav|ogg|m4a)$/i.test(f))!;
                        const testFile = path.join(playlistPath, filename);

                        try {
                            // Check if file exists and is readable
                            await fs.access(testFile);
                            debugLog.push(`✓ Sanity Check: File exists at ${testFile}`);
                        } catch (e: any) {
                            debugLog.push(`x Sanity Check Failed: ${e.message}`);
                        }
                    }
                }
            }
        }
        return { playlists, debugInfo: debugLog };
    } catch (error: any) {
        console.error('Error scanning audio:', error);
        return { playlists: [], debugInfo: [`Fatal Error: ${error.message}`] };
    }
});

// Open unique login window for Spotify (shares session with main window)
ipcMain.handle('app:spotifyLogin', async () => {
    return new Promise<void>((resolve) => {
        const loginWindow = new BrowserWindow({
            width: 800,
            height: 600,
            parent: mainWindow || undefined, // Modal if parent is set
            modal: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                webSecurity: false, // Ensure consistent session handling
                // Share session (default)
                // partition: 'persist:main_session'
            }
        });
        loginWindow.loadURL('https://accounts.spotify.com/login');

        // Resolve promise when closed
        loginWindow.on('closed', () => {
            resolve();
        });
    });
});

// App version
ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
});

// Open external URL
ipcMain.handle('app:openExternal', (_event, url: string) => {
    shell.openExternal(url);
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
