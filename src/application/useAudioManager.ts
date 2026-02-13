import { useEffect, useRef, useState } from 'react';

// Audio file paths (placeholders - replace with actual files later)
const AUDIO_FILES = {
    // Background Music
    bgMusic: 'media://ambient-background.wav',

    // UI Sounds
    click: 'media://ui-click.wav',
    hover: 'media://ui-hover.wav',

    // Game Events
    achievement: 'media://achievement-unlock.wav',
    operationComplete: 'media://operation-complete.wav',
    questAccept: 'media://quest-accept.wav',
    questComplete: 'media://quest-complete.wav',
    questFail: 'media://quest-fail.wav',

    // Threats
    threatWarning: 'media://threat-warning.wav',
    threatCritical: 'media://threat-critical.wav',
    gameOver: 'media://game-over.wav',

    // Resources
    resourceGain: 'media://resource-gain.wav',
    resourceLoss: 'media://resource-loss.wav',
};

export type SoundEffect = keyof typeof AUDIO_FILES;

export interface AudioSettings {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    muted: false,
};

// Load settings from storage
const loadSettings = (): AudioSettings => {
    try {
        const stored = localStorage.getItem('audio-settings');
        if (stored) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('Failed to load audio settings:', e);
    }
    return DEFAULT_SETTINGS;
};

// Save settings to storage
const saveSettings = (settings: AudioSettings) => {
    try {
        localStorage.setItem('audio-settings', JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save audio settings:', e);
    }
};

export const useAudioManager = () => {
    const [settings, setSettings] = useState<AudioSettings>(loadSettings);
    const bgMusicRef = useRef<HTMLAudioElement | null>(null);
    const sfxPoolRef = useRef<Map<SoundEffect, HTMLAudioElement[]>>(new Map());

    // Initialize background music
    useEffect(() => {
        // bgMusicRef.current = new Audio(AUDIO_FILES.bgMusic);
        // bgMusicRef.current.loop = true;
        // bgMusicRef.current.volume = settings.musicVolume * settings.masterVolume;

        // Disabled default music to use MusicPlayer component instead

        // Don't autoplay - wait for user interaction
        // Background music will start when user first interacts with the app

        return () => {
            bgMusicRef.current?.pause();
            bgMusicRef.current = null;
        };
    }, []);

    // Update volumes when settings change
    useEffect(() => {
        if (bgMusicRef.current) {
            bgMusicRef.current.volume = settings.musicVolume * settings.masterVolume;
            if (settings.muted) {
                bgMusicRef.current.pause();
            } else {
                bgMusicRef.current.play().catch(() => { });
            }
        }
        saveSettings(settings);
    }, [settings]);

    // Play sound effect
    const playSound = (effect: SoundEffect) => {
        if (settings.muted || effect === 'bgMusic') return;

        try {
            // Create or reuse audio element from pool
            let pool = sfxPoolRef.current.get(effect);
            if (!pool) {
                pool = [];
                sfxPoolRef.current.set(effect, pool);
            }

            // Find available audio element or create new one
            let audio = pool.find(a => a.paused);
            if (!audio) {
                audio = new Audio(AUDIO_FILES[effect]);
                pool.push(audio);
            }

            audio.volume = settings.sfxVolume * settings.masterVolume;
            audio.currentTime = 0;
            audio.play().catch(err => {
                console.warn(`Failed to play sound ${effect}:`, err);
            });
        } catch (err) {
            console.error(`Error playing sound ${effect}:`, err);
        }
    };

    // Update settings
    const updateSettings = (partial: Partial<AudioSettings>) => {
        setSettings(prev => ({ ...prev, ...partial }));
    };

    return {
        settings,
        updateSettings,
        playSound,
        toggleMute: () => updateSettings({ muted: !settings.muted }),
    };
};
