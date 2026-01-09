import { Volume2, VolumeX, Music, Headphones } from 'lucide-react';
import { useAudioManager } from '../../application/useAudioManager';

export const AudioSettings = () => {
    const { settings, updateSettings, toggleMute } = useAudioManager();

    return (
        <div className="space-y-6 p-6 bg-gray-900 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                    <Headphones className="w-5 h-5" />
                    Audio Settings
                </h2>
                <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                    title={settings.muted ? 'Unmute' : 'Mute'}
                >
                    {settings.muted ? (
                        <VolumeX className="w-5 h-5 text-red-400" />
                    ) : (
                        <Volume2 className="w-5 h-5 text-green-400" />
                    )}
                </button>
            </div>

            {/* Master Volume */}
            <div className="space-y-2">
                <label className="flex items-center justify-between text-sm text-gray-300">
                    <span className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        Master Volume
                    </span>
                    <span className="text-gray-400">{Math.round(settings.masterVolume * 100)}%</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.masterVolume * 100}
                    onChange={(e) => updateSettings({ masterVolume: parseInt(e.target.value) / 100 })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    disabled={settings.muted}
                />
            </div>

            {/* Music Volume */}
            <div className="space-y-2">
                <label className="flex items-center justify-between text-sm text-gray-300">
                    <span className="flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        Music Volume
                    </span>
                    <span className="text-gray-400">{Math.round(settings.musicVolume * 100)}%</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.musicVolume * 100}
                    onChange={(e) => updateSettings({ musicVolume: parseInt(e.target.value) / 100 })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    disabled={settings.muted}
                />
            </div>

            {/* SFX Volume */}
            <div className="space-y-2">
                <label className="flex items-center justify-between text-sm text-gray-300">
                    <span className="flex items-center gap-2">
                        <Headphones className="w-4 h-4" />
                        Sound Effects
                    </span>
                    <span className="text-gray-400">{Math.round(settings.sfxVolume * 100)}%</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sfxVolume * 100}
                    onChange={(e) => updateSettings({ sfxVolume: parseInt(e.target.value) / 100 })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    disabled={settings.muted}
                />
            </div>

            <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #10b981;
          border-radius: 50%;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #10b981;
          border-radius: 50%;
          border: none;
          cursor: pointer;
        }
        .slider:disabled::-webkit-slider-thumb {
          background: #6b7280;
        }
        .slider:disabled::-moz-range-thumb {
          background: #6b7280;
        }
      `}</style>
        </div>
    );
};
