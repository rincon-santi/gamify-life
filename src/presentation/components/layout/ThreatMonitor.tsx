import { motion } from "framer-motion";
import { useSocietyStore } from "../../../application/store";

export function ThreatMonitor() {
    const threats = useSocietyStore((s) => s.threats);

    return (
        <div className="flex flex-col gap-3 bg-black/60 backdrop-blur-md p-4 rounded-lg border border-border/50 shadow-inner">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold text-center mb-2 border-b border-border/30 pb-2">
                Threats
            </span>

            {Object.entries(threats).map(([key, value]) => (
                <div key={key} className="relative group flex flex-col gap-1">
                    <div className="flex justify-between items-end text-xs">
                        <span className="font-serif capitalize text-foreground/90 tracking-wide">{key.toLowerCase()}</span>
                        <span className="font-mono text-[10px] text-destructive/80 font-bold">{value.toFixed(1)}</span>
                    </div>

                    {/* Bar Container */}
                    <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden border border-white/5">
                        {/* Animated Bar */}
                        <motion.div
                            className="h-full bg-gradient-to-r from-destructive/60 to-destructive"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(value, 100)}%` }}
                            transition={{ type: "spring", stiffness: 50, damping: 20 }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
