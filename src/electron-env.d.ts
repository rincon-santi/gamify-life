export interface ElectronAPI {
    store: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<boolean>;
        delete: (key: string) => Promise<boolean>;
        clear: () => Promise<boolean>;
    };
    getVersion: () => Promise<string>;
    openExternal: (url: string) => Promise<void>;
    spotifyLogin: () => Promise<void>;
    window: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
        toggleFullscreen: () => void;
    };
    steam: {
        isAvailable: () => boolean;
        unlockAchievement: (achievementId: string) => Promise<boolean>;
    };
    audio: {
        getPlaylists: () => Promise<{ playlists: Array<{ name: string; tracks: Array<{ name: string; path: string }> }>; debugInfo: string[] }>;
    };
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
