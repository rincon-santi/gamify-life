import { useEffect, useState } from "react";
import { ResourceBar } from "./ResourceBar";
import { Navigation } from "./Navigation";
import { LedgerView } from "../../views/LedgerView";
import { useSocietyStore } from "../../../application/store";
import { ThreatMonitor } from "./ThreatMonitor";
import { MainMenu } from "../../views/MainMenu";
import { ReportModal } from "../modal/ReportModal";

export function Shell() {
    const [view, setView] = useState<'MAP' | 'LEDGER' | 'ARCHIVES'>('MAP');
    const [gameStarted, setGameStarted] = useState(false);

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
                <img src="/assets/study_background.png" className="w-full h-full object-cover opacity-20 sepia-[0.5] contrast-125" alt="" />
                <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
            </div>
            {/* Paper Texture Overlay */}
            <div className="fixed inset-0 z-[-1] pointer-events-none mix-blend-soft-light opacity-60">
                <img src="/assets/texture_paper.png" className="w-full h-full object-cover" alt="" />
            </div>

            <ResourceBar />

            <div className="flex flex-1 overflow-hidden">
                <div className="flex flex-col w-64 border-r border-border/40 bg-black/60 backdrop-blur-md justify-between pb-4 transition-all">
                    <Navigation activeView={view} onViewChange={setView} />
                    <div className="px-4 pb-4">
                        <ThreatMonitor />
                    </div>
                </div>

                <div className="flex-1 relative p-8 overflow-y-auto">
                    {view === 'MAP' && (
                        <div className="flex items-center justify-center h-full text-muted-foreground font-serif italic text-xl">
                            "The world is vast, and shadows lengthen..." (Map Implementation Pending)
                        </div>
                    )}
                    {view === 'LEDGER' && <LedgerView />}
                    {view === 'ARCHIVES' && (
                        <div className="flex items-center justify-center h-full text-muted-foreground font-serif italic text-xl">
                            "History is written by the victors." (Archives Pending)
                        </div>
                    )}
                </div>
            </div>

            <ReportModal />
        </div>
    );
}
