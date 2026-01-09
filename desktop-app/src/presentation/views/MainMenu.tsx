import { motion } from "framer-motion";
import { useState } from "react";
import { useSocietyStore, type Difficulty } from "../../application/store";
import { cn } from "../../shared/utils";
import { useAudio } from "../../application/AudioContext";
import { AudioSettings } from "../components/AudioSettings";
import { Settings } from "lucide-react";

interface MainMenuProps {
    onStart: () => void;
}

export function MainMenu({ onStart }: MainMenuProps) {
    const setDifficulty = useSocietyStore((s) => s.setDifficulty);
    const reset = useSocietyStore((s) => s.reset);
    const canContinue = useSocietyStore((s) => s.hasStarted());
    const { playSound } = useAudio();

    const [view, setView] = useState<'MAIN' | 'NEW_GAME' | 'SETTINGS'>('MAIN');
    const [selectedDiff, setSelectedDiff] = useState<Difficulty>('MEDIUM');

    const handleContinue = () => {
        playSound('click');
        onStart();
    };

    const handleNewGameStart = () => {
        playSound('click');
        reset();
        setDifficulty(selectedDiff);
        onStart();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            {/* Background Image */}
            <div className="absolute inset-0 opacity-40 bg-[url('/assets/study_background.png')] bg-cover bg-center"></div>

            <div className="relative z-10 flex flex-col items-center gap-8">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-6xl md:text-8xl font-serif text-primary tracking-tighter drop-shadow-2xl text-center"
                >
                    The Hidden<br />Covenant
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="flex flex-col gap-6 w-80 items-center"
                >
                    {view === 'MAIN' && (
                        <>
                            {canContinue && (
                                <button
                                    onClick={handleContinue}
                                    className="w-full bg-card/10 hover:bg-primary/20 hover:border-primary border border-white/10 text-foreground py-4 px-8 backdrop-blur-sm transition-all duration-300 font-serif text-lg tracking-widest uppercase flex flex-col items-center"
                                >
                                    <span>Continue Lineage</span>
                                </button>
                            )}

                            <button
                                onClick={() => { playSound('click'); setView('NEW_GAME'); }}
                                className={cn(
                                    "w-full hover:bg-white/5 hover:border-white/20 border border-transparent text-muted-foreground transition-all duration-300 font-serif tracking-widest uppercase flex flex-col items-center",
                                    canContinue ? "py-2 text-sm" : "bg-card/10 border-white/10 text-foreground py-4 px-8 text-lg hover:border-primary hover:bg-primary/20"
                                )}
                            >
                                <span>{canContinue ? "Begin New Lineage" : "Begin Lineage"}</span>
                            </button>

                            <button
                                onClick={() => { playSound('click'); setView('SETTINGS'); }}
                                className="w-full hover:bg-white/5 hover:border-white/20 border border-transparent text-muted-foreground transition-all duration-300 font-serif tracking-widest uppercase flex items-center justify-center gap-2 py-2 text-sm"
                            >
                                <Settings className="w-4 h-4" />
                                <span>Settings</span>
                            </button>
                        </>
                    )}

                    {view === 'NEW_GAME' && (
                        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Difficulty Selector */}
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Select Difficulty</label>
                                <div className="flex gap-2 justify-center">
                                    {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setSelectedDiff(d)}
                                            className={cn(
                                                "flex-1 py-2 text-xs font-bold uppercase border transition-all duration-300",
                                                selectedDiff === d
                                                    ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                                    : "border-white/10 text-muted-foreground hover:bg-white/5 hover:border-white/20"
                                            )}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-center text-muted-foreground h-4">
                                    {selectedDiff === 'EASY' && "For those who wish a slow descent (1 Month)."}
                                    {selectedDiff === 'MEDIUM' && "The standard timeline (1 Week)."}
                                    {selectedDiff === 'HARD' && "A swift and brutal end (3 Days)."}
                                </p>
                            </div>

                            <button
                                onClick={handleNewGameStart}
                                className="w-full bg-card/10 hover:bg-primary/20 hover:border-primary border border-white/10 text-foreground py-4 px-8 backdrop-blur-sm transition-all duration-300 font-serif text-lg tracking-widest uppercase flex flex-col items-center"
                            >
                                <span>Begin</span>
                            </button>

                            <button
                                onClick={() => { playSound('click'); setView('MAIN'); }}
                                className="text-xs text-muted-foreground hover:text-white uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {view === 'SETTINGS' && (
                        <div className="flex flex-col gap-6 w-96 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <AudioSettings />
                            <button
                                onClick={() => { playSound('click'); setView('MAIN'); }}
                                className="text-xs text-muted-foreground hover:text-white uppercase tracking-widest"
                            >
                                Back
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
