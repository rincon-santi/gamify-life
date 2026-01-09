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
        toggleFullscreen: () => void;
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
