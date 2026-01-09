import { useMemo, useEffect, useState } from "react";
import { motion, useTime, useTransform, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";
import { useSocietyStore, MAX_THREAT } from "../../application/store";

export function MapView() {
    const resources = useSocietyStore(s => s.resources);
    const threats = useSocietyStore(s => s.threats);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Raw values are key here
    const infRaw = resources.INFLUENCE;
    const ordRaw = resources.ORDER;
    const conRaw = resources.CONNECTION;

    // --- EXPONENTIAL / HARD CURVE SCALING ---
    // User wants "easy to go from 1 to 2, really hard to reach last level".
    // We'll define specific thresholds that get wider apart.
    // Tiers: [10, 50, 150, 300, 600, 1000, 1500, 2000]

    // Connection: Stars scaling
    const activeConnection = Math.min(conRaw / 2000, 1);

    // Threats
    const entropy = Math.min(threats.ENTROPY / MAX_THREAT, 1) || 0;
    const stagnation = Math.min(threats.STAGNATION / MAX_THREAT, 1) || 0;

    // Animations
    const time = useTime();
    const speedMultiplier = Math.max(0.2, 1 - stagnation);

    const slowRotate = useTransform(time, [0, 30000], [0, 360 * speedMultiplier], { clamp: false });
    const reverseSlowRotate = useTransform(time, [0, 30000], [0, -360 * speedMultiplier], { clamp: false });
    const medRotate = useTransform(time, [0, 15000], [0, -360 * speedMultiplier], { clamp: false });
    // fastRotate removed (unused)
    const outerRotate = useTransform(time, [0, 60000], [0, 360 * speedMultiplier], { clamp: false });

    const [noiseUrl, setNoiseUrl] = useState("");
    useEffect(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            for (let i = 0; i < 200 * 200; i++) {
                const x = i % 200;
                const v = Math.random() * 30;
                ctx.fillStyle = `rgba(${v},${v},${v},0.08)`;
                ctx.fillRect(x, Math.floor(i / 200), 1, 1);
            }
            setNoiseUrl(canvas.toDataURL());
        }
    }, []);

    // --- STARS (Increased Cap) ---
    // Linear is fine for stars, they are discrete particles
    const starCount = Math.min(600, Math.floor(conRaw * 0.6));

    const allStars = useMemo(() => {
        return Array.from({ length: 700 }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const radius = 250 + Math.random() * 350;
            return {
                id: i,
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                size: 1 + Math.random() * 2,
                delay: Math.random() * 5,
            };
        });
    }, []);

    const visibleStars = allStars.slice(0, starCount);

    const baseScale = 0.6;
    const containerClass = isFullscreen
        ? "fixed inset-0 z-[100] flex items-center justify-center bg-[#020202] overflow-hidden isolate"
        : "relative w-full h-full flex items-center justify-center bg-[#020202] overflow-hidden isolate";

    const handleToggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (window.electronAPI?.window?.toggleFullscreen) {
            window.electronAPI.window.toggleFullscreen();
        }
    };

    return (
        <div className={containerClass}>

            <button
                onClick={handleToggleFullscreen}
                className="absolute top-6 right-6 z-[200] p-2 rounded-full bg-black/50 text-white/30 hover:text-amber-400 hover:bg-black/80 transition-all border border-white/10 hover:border-amber-500/50 backdrop-blur-sm"
            >
                {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>

            <svg className="absolute w-0 h-0">
                <defs>
                    <filter id="coreGlow" height="300%" width="300%" x="-100%" y="-100%">
                        <feGaussianBlur stdDeviation={10 + (activeConnection * 30)} result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="entropyGlitch">
                        <feTurbulence type="fractalNoise" baseFrequency={0.01 + (entropy * 0.2)} numOctaves="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale={entropy * 40} />
                    </filter>
                </defs>
            </svg>

            <div className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay" style={{ backgroundImage: `url(${noiseUrl})` }}></div>

            <div
                className="absolute inset-0 z-40 pointer-events-none transition-opacity duration-1000"
                style={{
                    opacity: stagnation,
                    background: `radial-gradient(circle, transparent ${60 - (stagnation * 40)}%, rgba(200, 230, 255, 0.1) 100%)`,
                    backdropFilter: `blur(${stagnation * 2}px)`
                }}
            >
                <div className="absolute inset-0 opacity-30 mix-blend-screen bg-[url('/assets/texture_paper.png')] invert brightness-150 contrast-200"></div>
            </div>

            <motion.div
                className="absolute inset-0 z-0 bg-gradient-radial from-amber-900/20 via-[#0a0a0a] to-black"
                animate={{ opacity: 0.6 + (activeConnection * 0.4) }}
            />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ transform: `scale(${baseScale})` }}>
                <motion.div style={{ rotate: outerRotate, filter: "url(#entropyGlitch)" }} className="absolute size-[1200px] opacity-60">
                    <svg viewBox="0 0 1200 1200" className="w-full h-full overflow-visible">
                        <circle cx="600" cy="600" r="550" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="10 20" />
                        <circle cx="600" cy="600" r="580" fill="none" stroke="#fbbf24" strokeWidth="0.5" />
                        {[0, 90, 180, 270].map((deg, i) => (
                            <g key={i} transform={`rotate(${deg} 600 600)`}>
                                <rect x="590" y="20" width="20" height="20" fill="none" stroke="#fbbf24" strokeWidth="2" transform="rotate(45 600 30)" />
                                <line x1="600" y1="20" x2="600" y2="100" stroke="#fbbf24" strokeWidth="1" />
                            </g>
                        ))}
                    </svg>
                </motion.div>
                <motion.div className="absolute size-[1000px] opacity-40" style={{ filter: "url(#entropyGlitch)" }}>
                    <motion.div style={{ rotate: reverseSlowRotate }} className="absolute inset-0 flex items-center justify-center">
                        <div className="size-[800px] border border-cyan-900/60 rotate-12" />
                    </motion.div>
                    <motion.div style={{ rotate: slowRotate }} className="absolute inset-0 flex items-center justify-center">
                        <div className="size-[800px] border border-cyan-900/60 -rotate-12" />
                    </motion.div>
                </motion.div>
            </div>

            <div className="relative z-20 size-[800px] flex items-center justify-center" style={{ transform: `scale(${baseScale})` }}>

                <div className="absolute inset-0 pointer-events-none">
                    <AnimatePresence>
                        {visibleStars.map((star) => (
                            <motion.div
                                key={star.id}
                                className="absolute bg-white rounded-full shadow-[0_0_4px_white]"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.5, 1] }} // Brighter stars
                                transition={{ duration: 3 + star.delay, repeat: Infinity, repeatType: "reverse", delay: star.delay }}
                                style={{
                                    left: 400 + star.x,
                                    top: 400 + star.y,
                                    width: star.size,
                                    height: star.size,
                                }}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* CORE */}
                <motion.div
                    className="absolute z-30 size-24 rounded-full bg-gradient-to-br from-amber-100 to-amber-500"
                    style={{ filter: "url(#coreGlow)" }}
                    animate={{ scale: [1, 1.05, 1], opacity: 0.9 + (activeConnection * 0.1) }}
                    transition={{ duration: 4 / speedMultiplier, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* ARCANE BACKGROUND */}
                <motion.div className="absolute z-10 size-[600px] pointer-events-none opacity-50" style={{ filter: "url(#entropyGlitch)" }}>
                    <motion.div style={{ rotate: reverseSlowRotate }} className="absolute inset-0 flex items-center justify-center">
                        <div className="size-[450px] border border-amber-900/50 rotate-45" />
                    </motion.div>
                    <motion.div style={{ rotate: slowRotate }} className="absolute inset-0 flex items-center justify-center">
                        <div className="size-[450px] border border-amber-900/50" />
                    </motion.div>
                </motion.div>

                {/* 
                  INFLUENCE FILIGREE (8 EXPONENTIAL TIERS) - REVERTED TO OVERLAPPING MIX
                  [10, 50, 150, 300, 600, 1000, 1500, 2000]
                */}
                <motion.div style={{ rotate: medRotate }} className="absolute z-20 size-[400px] opacity-90 pointer-events-none">
                    <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
                        <circle cx="200" cy="200" r="60" fill="none" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.7" />

                        {/* Tier 1: > 10 */}
                        {infRaw > 10 && [...Array(4)].map((_, i) => (
                            <rect key={`tier1-${i}`} x="195" y="100" width="10" height="10" fill="none" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.6" transform={`rotate(${i * 90} 200 200)`} />
                        ))}

                        {/* Tier 2: > 50 */}
                        {infRaw > 50 && <circle cx="200" cy="200" r="90" fill="none" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.5" />}

                        {/* Tier 3: > 150 */}
                        {infRaw > 150 && [...Array(8)].map((_, i) => (
                            <path key={`tier3-${i}`} d="M 200 130 L 230 200 L 200 270 L 170 200 Z" fill="none" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.4" transform={`rotate(${i * 45} 200 200)`} />
                        ))}

                        {/* Tier 4: > 300 (Radiant Spikes Small) */}
                        {infRaw > 300 && [...Array(8)].map((_, i) => (
                            <line key={`tier4-${i}`} x1="200" y1="200" x2="200" y2="80" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.5" transform={`rotate(${22.5 + (i * 45)} 200 200)`} />
                        ))}

                        {/* Tier 5: > 600 (Hexagon) */}
                        {infRaw > 600 && (
                            <path d="M 200 320 L 303 260 L 303 140 L 200 80 L 97 140 L 97 260 Z" fill="none" stroke="#fbbf24" strokeWidth="0.8" strokeOpacity="0.4" />
                        )}

                        {/* Tier 6: > 1000 (Radiant Beams Large) */}
                        {infRaw > 1000 && [...Array(12)].map((_, i) => (
                            <line key={`tier6-${i}`} x1="200" y1="200" x2="200" y2="40" stroke="#fbbf24" strokeWidth="0.8" strokeOpacity="0.3" transform={`rotate(${i * 30} 200 200)`} />
                        ))}

                        {/* Tier 7: > 1500 (Complex Flower) */}
                        {infRaw > 1500 && [...Array(6)].map((_, i) => (
                            <circle key={`tier7-${i}`} cx="200" cy="140" r="60" fill="none" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.3" transform={`rotate(${i * 60} 200 200)`} />
                        ))}

                        {/* Tier 8: > 2000 (Sun Corona) */}
                        {infRaw > 2000 && (
                            <g>
                                <circle cx="200" cy="200" r="180" fill="none" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.8" strokeDasharray="2 2" />
                                <circle cx="200" cy="200" r="190" fill="none" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.4" />
                            </g>
                        )}
                    </svg>
                </motion.div>

                {/* 
                  ORDER RINGS (5 EXPONENTIAL RINGS)
                  [10, 100, 300, 600, 1000] for adding rings.
                  Thickness scales continuously.
                */}
                <motion.div
                    className="absolute z-10 size-[700px] pointer-events-none"
                    style={{ filter: "url(#entropyGlitch)" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120 / speedMultiplier, repeat: Infinity, ease: "linear" }}
                >
                    <svg viewBox="0 0 700 700" className="w-full h-full overflow-visible">
                        {/* Ring 1: > 10 */}
                        {ordRaw > 10 && (
                            <circle cx="350" cy="350" r="180" fill="none" stroke="#a5f3fc" strokeWidth={1 + (ordRaw / 500)} strokeOpacity="0.5" strokeDasharray={entropy > 0.2 ? `${100 - (entropy * 80)} ${entropy * 30}` : "none"} />
                        )}

                        {/* Ring 2: > 100 */}
                        {ordRaw > 100 && (
                            <circle cx="350" cy="350" r="220" fill="none" stroke="#a5f3fc" strokeWidth={1 + (ordRaw / 600)} strokeOpacity="0.4" strokeDasharray={entropy > 0.3 ? `${40 - (entropy * 30)} ${entropy * 20}` : "2 10"} />
                        )}

                        {/* Ring 3: > 300 */}
                        {ordRaw > 300 && (
                            <circle cx="350" cy="350" r="260" fill="none" stroke="#ecfeff" strokeWidth={1 + (ordRaw / 700)} strokeOpacity="0.4" strokeDasharray="4 4" />
                        )}

                        {/* Ring 4: > 600 */}
                        {ordRaw > 600 && (
                            <circle cx="350" cy="350" r="300" fill="none" stroke="#a5f3fc" strokeWidth={1.5 + (ordRaw / 800)} strokeOpacity="0.3" />
                        )}

                        {/* Ring 5: > 1000 */}
                        {ordRaw > 1000 && (
                            <circle cx="350" cy="350" r="340" fill="none" stroke="#a5f3fc" strokeWidth={2 + (ordRaw / 1000)} strokeOpacity="0.3" strokeDasharray={entropy > 0.4 ? `${200 - (entropy * 150)} ${entropy * 50}` : "none"} />
                        )}
                    </svg>
                </motion.div>
            </div>

            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <div className="inline-flex gap-12 font-mono text-[10px] text-white/50 tracking-widest uppercase">
                    <span className="flex items-center gap-2">
                        <span className="size-1 rounded-full bg-amber-500 shadow-[0_0_5px_currentColor]"></span>
                        Inf {infRaw}
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="size-1 rounded-full bg-cyan-400 shadow-[0_0_5px_currentColor]"></span>
                        Ord {ordRaw}
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="size-0.5 rounded-full bg-white shadow-[0_0_5px_currentColor]"></span>
                        Con {conRaw}
                    </span>
                </div>
            </div>
        </div>
    );
}
