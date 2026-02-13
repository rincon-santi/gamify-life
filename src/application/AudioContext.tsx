import React, { createContext, useContext, type ReactNode } from 'react';
import { useAudioManager, type SoundEffect, type AudioSettings } from '../application/useAudioManager';

interface AudioContextType {
    playSound: (effect: SoundEffect) => void;
    toggleMute: () => void;
    isMuted: boolean;
    settings: AudioSettings;
    updateSettings: (settings: Partial<AudioSettings>) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { playSound, toggleMute, settings, updateSettings } = useAudioManager();

    return (
        <AudioContext.Provider value={{ playSound, toggleMute, isMuted: settings.muted, settings, updateSettings }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within AudioProvider');
    }
    return context;
};
