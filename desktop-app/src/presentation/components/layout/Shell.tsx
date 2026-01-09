import { useEffect, useState } from "react";
import { ResourceBar } from "./ResourceBar";
import { Navigation } from "./Navigation";
import { LedgerView } from "../../views/LedgerView";
import { useSocietyStore } from "../../../application/store";
import { ThreatMonitor } from "./ThreatMonitor";
import { MainMenu } from "../../views/MainMenu";
import { ReportModal } from "../modal/ReportModal";
import { AchievementsPanel } from "../AchievementsPanel";
import { Trophy } from "lucide-react";
import { ArchivesView } from "../../views/ArchivesView";
import { MapView } from "../../views/MapView";

export function Shell() {
    const [view, setView] = useState<'MAP' | 'LEDGER' | 'ARCHIVES'>('LEDGER');
    const [gameStarted, setGameStarted] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);

    const tick = useSocietyStore((s) => s.tick);
    const threats = useSocietyStore((s) => s.threats);

    const isGameOver = Object.values(threats).some(v => v >= 100);

    // Game Loop
    useEffect(() => {
        if (!gameStarted || isGameOver) return;
        const interval = setInterval(() => {
            tick();
        }, 1000); // 1 tick per second
        return () => clearInterval(interval);
    }, [tick, gameStarted, isGameOver]);

    // Handle Game Over Screen
    if (gameStarted && isGameOver) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-red-600 font-serif relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/study_background.png')] bg-cover bg-center opacity-20 grayscale mix-blend-overlay"></div>
                {/* Paper Texture Overlay */}
                <div className="absolute inset-0 z-0 pointer-events-none mix-blend-soft-light opacity-50 bg-[url('/assets/texture_paper.png')] bg-cover"></div>

                <h1 className="text-8xl mb-4 z-10 animate-pulse tracking-widest drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">RUIN</h1>
                <p className="text-xl text-red-400 z-10 max-w-md text-center">
                    The Covenant has fallen. The world succumbs to entropy and silence.
                </p>
                <button
                    onClick={() => {
                        window.localStorage.clear(); // Hard reset for MVP
                        window.location.reload();
                    }}
                    className="mt-12 px-8 py-3 border border-red-900 text-red-500 hover:bg-red-950/30 z-10 uppercase tracking-widest transition-all hover:scale-105"
                >
                    Begin Anew
                </button>
            </div>
        );
    }

    if (!gameStarted) {
        return <MainMenu onStart={() => setGameStarted(true)} />;
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden relative selection:bg-primary/30">
            {/* Global Background Layer - Fixed position to ensure coverage */}
            <div className="fixed inset-0 z-[-1]">
                <img src="/assets/study_background.png"
                    className="w-full h-full object-cover sepia-[0.5] contrast-125 transition-opacity duration-1000"
                    style={{ opacity: Math.max(0.1, 0.4 - (threats.SOLITUDE / 200)) }} // 0.4 at 0, 0.15 at 50, 0 at 100 (almost)
                    alt="" />
                {/* Dynamic Darkness Overlay based on Solitude */}
                <div
                    className="absolute inset-0 bg-black mix-blend-multiply transition-opacity duration-1000"
                    style={{ opacity: 0.2 + (threats.SOLITUDE / 120) }} // 0.2 at 0 -> 1.0 at ~100
                ></div>
            </div>
            {/* Paper Texture Overlay */}
            <div className="fixed inset-0 z-[-1] pointer-events-none mix-blend-soft-light opacity-60">
                <img src="/assets/texture_paper.png" className="w-full h-full object-cover" alt="" />
            </div>

            <ResourceBar />

            <div className="flex flex-1 overflow-hidden">
                <div className="flex flex-col w-64 border-r border-border/40 bg-black/60 backdrop-blur-md justify-between pb-4 transition-all">
                    <Navigation activeView={view} onViewChange={setView} />

                    <button
                        onClick={() => setShowAchievements(true)}
                        className="mx-2 mb-2 flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all duration-300 group"
                    >
                        <Trophy className="size-5 text-muted-foreground group-hover:text-yellow-500 transition-colors" />
                        <span className="font-serif text-sm tracking-wide">Achievements</span>
                    </button>

                    <div className="px-4 pb-4">
                        <ThreatMonitor />
                    </div>
                </div>

                <div className="flex-1 relative p-8 overflow-y-auto">
                    {view === 'MAP' && <MapView />}
                    {view === 'LEDGER' && <LedgerView />}
                    {view === 'ARCHIVES' && <ArchivesView />}
                </div>
            </div>

            <ReportModal />
            {/* Explicitly cast to any if needed or just rely on correct import - trying cleanly first */}
            <AchievementsPanel isOpen={showAchievements} onClose={() => setShowAchievements(false)} />
        </div>
    );
}

