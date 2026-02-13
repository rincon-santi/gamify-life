import { useEffect, useRef, useState } from "react";
import { useAudio } from "../../../application/AudioContext";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, ListMusic, Disc } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Track {
    name: string;
    path: string;
}

interface Playlist {
    name: string;
    tracks: Track[];
}

declare global {
    interface Window {
        _spotifyWebview: any;
    }
}

export function MusicPlayer() {
    const { settings, updateSettings } = useAudio();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [currentPlaylistName, setCurrentPlaylistName] = useState<string | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initial Load & Fullscreen Detection
    useEffect(() => {
        const loadPlaylists = async () => {
            try {
                if (window.electronAPI?.audio?.getPlaylists) {
                    const result = await window.electronAPI.audio.getPlaylists();
                    // Handle new object return or legacy array
                    const found = Array.isArray(result) ? result : result.playlists;

                    console.log("Loaded Playlists:", found);
                    // Standardize paths
                    setPlaylists(found);

                    // Auto-select first playlist if available AND start playing
                    if (found.length > 0) {
                        setCurrentPlaylistName(found[0].name);
                        setIsPlaying(true); // Autoplay on app start
                    }
                } else {
                    console.warn("Audio API not available");
                }
            } catch (e) {
                console.error("Failed to load playlists", e);
            }
        };
        loadPlaylists();

        // Fullscreen listener
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Audio Element Management
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.onended = handleNext;

            // Capture playback errors
            audioRef.current.onerror = (_e) => {
                const audio = audioRef.current;
                if (!audio) return;

                const err = audio.error;
                const msg = err ? `Code ${err.code}: ${err.message}` : 'Network/Decode Error';
                console.error("Audio playback error:", msg);
            };
        }

        const audio = audioRef.current;
        // Update volume - Master * Music
        // If muted global, vol = 0
        const effectiveVolume = settings.muted ? 0 : (settings.masterVolume * settings.musicVolume);
        audio.volume = effectiveVolume;

        return () => {
            // Cleanup if needed
        };
    }, [settings.masterVolume, settings.musicVolume, settings.muted]);

    // Track Change Logic
    useEffect(() => {
        if (!currentPlaylistName || playlists.length === 0) return;

        const playlist = playlists.find(p => p.name === currentPlaylistName);
        if (!playlist || playlist.tracks.length === 0) return;

        const track = playlist.tracks[currentTrackIndex];
        if (!track) return;

        const audio = audioRef.current;
        if (audio) {
            // Ensure encoded URI for spaces/special chars
            // media:// protocol needs careful handling? 
            // The protocol handler expects component encoded URL, but browser might double encode.
            // Let's try direct path first.
            const src = track.path;

            // Prevent reload if same src
            if (audio.src !== src && audio.src !== window.location.origin + src) {
                audio.src = src;
                // console.log(`Setting audio src to: ${src}`);
                if (isPlaying) {
                    audio.play().catch(e => {
                        console.error("Play error:", e);
                        // Don't stop playing immediately on error, might be loading
                    });
                }
            }
        }
    }, [currentPlaylistName, currentTrackIndex, playlists]);

    // Force Play/Pause Sync
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Playback prevented:", error);
                    // setIsPlaying(false); // Don't force state sync yet, let user retry
                });
            }
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    // ... handle functions ...
    const handleNext = () => {
        const playlist = playlists.find(p => p.name === currentPlaylistName);
        if (!playlist) return;

        let nextIndex = currentTrackIndex + 1;
        if (nextIndex >= playlist.tracks.length) {
            nextIndex = 0; // Loop to start
        }
        setCurrentTrackIndex(nextIndex);
        setIsPlaying(true);
    };

    // Attach handleNext to audio.onended specifically when dependencies change
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.onended = handleNext;
        }
    }, [handleNext]); // Re-attach when handleNext changes (which depends on state)

    const handlePrev = () => {
        const playlist = playlists.find(p => p.name === currentPlaylistName);
        if (!playlist) return;

        let prevIndex = currentTrackIndex - 1;
        if (prevIndex < 0) {
            prevIndex = playlist.tracks.length - 1;
        }
        setCurrentTrackIndex(prevIndex);
        setIsPlaying(true);
    };


    const currentPlaylist = playlists.find(p => p.name === currentPlaylistName);
    const currentTrack = currentPlaylist?.tracks[currentTrackIndex];
    const hasLocalMusic = playlists.length > 0;

    // ... 

    return (
        <motion.div
            layout
            className={`fixed bottom-0 right-0 z-[5000] transition-all duration-500 ease-in-out bg-black/90 backdrop-blur-md border md:border-t md:border-l border-white/10 shadow-2xl 
            ${isExpanded ? 'w-80 rounded-tl-xl' : 'w-auto rounded-tl-lg bg-transparent border-none'}
            ${isFullscreen ? 'translate-y-[92%] hover:translate-y-0 opacity-100' : ''}
            `}
        >
            <div className="p-3">
                {/* Mini Player */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-2 rounded-full transition-all duration-300 group ${isExpanded ? 'bg-primary/20 text-primary' : 'bg-black/60 text-muted-foreground hover:bg-black/80 hover:text-white'}`}
                    >
                        {isExpanded ? <ListMusic className="size-5" /> : <Disc className={`size-6 transition-transform duration-[3s] ease-linear ${(isPlaying) ? 'animate-spin' : 'group-hover:rotate-12'}`} />}
                    </button>

                    <AnimatePresence>
                        {!isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="overflow-hidden whitespace-nowrap"
                            >
                                <span className="text-xs font-serif text-muted-foreground pr-4 select-none">
                                    {isPlaying ? (currentTrack?.name || 'Local') : 'Paused'}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Expanded Interface */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 overflow-hidden"
                        >
                            {/* Debug Info Removed */}

                            {hasLocalMusic ? (
                                <>
                                    {/* Playlist Selector - Styled */}
                                    <div className="mb-6 mt-4 relative group">
                                        <div className="absolute inset-x-0 -top-3 flex justify-center z-10">
                                            <span className="bg-black/90 px-2 text-[10px] text-muted-foreground uppercase tracking-widest border border-white/10 rounded-full">Collection</span>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={currentPlaylistName || ''}
                                                onChange={(e) => {
                                                    setCurrentPlaylistName(e.target.value);
                                                    setCurrentTrackIndex(0);
                                                    setIsPlaying(true);
                                                }}
                                                className="w-full appearance-none bg-transparent border border-white/20 rounded-lg text-center py-3 text-sm font-serif text-white focus:outline-none focus:border-primary transition-colors cursor-pointer hover:border-white/40 pt-4"
                                            >
                                                {playlists.map(p => (
                                                    <option key={p.name} value={p.name} className="bg-black text-white">{p.name}</option>
                                                ))}
                                            </select>
                                            {/* Custom Arrow */}
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-white transition-colors">
                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
                                                    <path d="M0 0L5 6L10 0H0Z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Track Info */}
                                    <div className="mb-6 text-center">
                                        <div className="text-white font-serif text-lg truncate mb-1 leading-tight drop-shadow-md">
                                            {currentTrack?.name}
                                        </div>
                                        <div className="text-[10px] text-primary/80 uppercase tracking-widest">
                                            {currentTrackIndex + 1} / {currentPlaylist?.tracks.length}
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex justify-center items-center gap-6 mb-4">
                                        <button onClick={handlePrev} className="text-muted-foreground hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                            <SkipBack className="size-5" />
                                        </button>
                                        <button
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className="p-4 bg-primary text-primary-foreground rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:shadow-[0_0_30px_rgba(var(--primary),0.6)]"
                                        >
                                            {isPlaying ? <Pause className="size-6 fill-current" /> : <Play className="size-6 ml-1 fill-current" />}
                                        </button>
                                        <button onClick={handleNext} className="text-muted-foreground hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                            <SkipForward className="size-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-xs border border-dashed border-white/10 rounded-lg">
                                    <p className="mb-2">No local music found.</p>
                                    <p className="opacity-50 text-[10px]">Add folders to public/audio</p>
                                </div>
                            )}

                            {/* Volume */}
                            <div className="flex items-center gap-3 px-2 pt-2 border-t border-white/5 mt-2">
                                <button onClick={() => updateSettings({ muted: !settings.muted })} className="text-muted-foreground hover:text-white transition-colors">
                                    {settings.muted ? <VolumeX className="size-4 text-red-500" /> : <Volume2 className="size-4" />}
                                </button>
                                <div className="flex-1 relative h-1 bg-white/10 rounded-full overflow-hidden group">
                                    <div
                                        className="absolute left-0 top-0 bottom-0 bg-primary transition-all duration-100 ease-out group-hover:bg-primary/80"
                                        style={{ width: `${settings.muted ? 0 : settings.musicVolume * 100}%` }}
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={settings.musicVolume}
                                        onChange={(e) => updateSettings({ musicVolume: parseFloat(e.target.value) })}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div >
    );
}
