/**
 * Storage Adapter
 * 
 * Provides a unified storage interface that works in both:
 * - Electron (uses IPC to electron-store)
 * - Browser (falls back to localStorage)
 * 
 * This allows the same Zustand store code to work in both environments.
 */

interface StorageAPI {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
}

// Check if we're running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

const electronStorage: StorageAPI = {
    getItem: async (key: string) => {
        const value = await window.electronAPI.store.get(key);
        return value ? JSON.stringify(value) : null;
    },
    setItem: async (key: string, value: string) => {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        await window.electronAPI.store.set(key, parsed);
    },
    removeItem: async (key: string) => {
        await window.electronAPI.store.delete(key);
    },
};

const browserStorage: StorageAPI = {
    getItem: async (key: string) => {
        return localStorage.getItem(key);
    },
    setItem: async (key: string, value: string) => {
        localStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
        localStorage.removeItem(key);
    },
};

// Export the appropriate storage implementation
export const storage = isElectron ? electronStorage : browserStorage;

// Custom storage object for Zustand persist middleware
// Custom storage object for Zustand persist middleware
export const createStorage = () => ({
    getItem: async (name: string): Promise<any> => {
        const value = await storage.getItem(name);
        return value ? JSON.parse(value) : null;
    },
    setItem: async (name: string, value: any): Promise<void> => {
        const stringified = JSON.stringify(value);
        return storage.setItem(name, stringified);
    },
    removeItem: (name: string): Promise<void> => {
        return storage.removeItem(name);
    },
});
