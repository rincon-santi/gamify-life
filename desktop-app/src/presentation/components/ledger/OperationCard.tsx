import { motion } from "framer-motion";
import { Check, Clock, Skull, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Operation } from "../../../domain/logic";
import { useSocietyStore } from "../../../application/store";
import { cn } from "../../../shared/utils";

interface OperationCardProps {
    operation: Operation;
    onDelete?: () => void;
}

// ... (imports)

// Helper to format duration
const formatDuration = (ms: number) => {
    if (ms < 0) return "0s";
    const seconds = Math.floor(ms / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
};

export function OperationCard({ operation, onDelete }: OperationCardProps) {
    const executeOperation = useSocietyStore((s) => s.executeOperation);
    const resources = useSocietyStore((s) => s.resources);
    const [progress, setProgress] = useState(0);
    const [timeLabel, setTimeLabel] = useState<string>("");

    // Calculate if affordable
    const canAfford = !operation.cost || Object.entries(operation.cost).every(
        ([res, amount]) => resources[res as keyof typeof resources] >= amount
    );

    // Progress / Rotting Logic
    useEffect(() => {
        const updateProgress = () => {
            const now = Date.now();
            let p = 0;
            let label = "";

            if (operation.type === 'QUEST' && operation.expiresAt && operation.createdAt) {
                const totalDuration = operation.expiresAt - operation.createdAt;
                const elapsed = now - operation.createdAt;
                p = Math.min((elapsed / totalDuration) * 100, 100);

                const remaining = operation.expiresAt - now;
                label = remaining > 0 ? `Expires in ${formatDuration(remaining)}` : "Expired";

            } else if (operation.type === 'RITUAL' && operation.recurrenceInterval) {
                // For rituals, it "rots" from last completion
                const lastTime = operation.lastCompleted || operation.createdAt || now;
                const elapsed = now - lastTime;
                p = Math.min((elapsed / operation.recurrenceInterval) * 100, 100);

                const remaining = operation.recurrenceInterval - elapsed;
                label = remaining > 0 ? `Rots in ${formatDuration(remaining)}` : "Rotten";
            }
            setProgress(p);
            setTimeLabel(label);
        };

        updateProgress();
        const interval = setInterval(updateProgress, 1000); // Create a heartbeat
        return () => clearInterval(interval);
    }, [operation]);


    const isRotten = progress >= 100;

    const handleCardClick = () => {
        // Prevent execution if clicking delete (though delete will be separate button)
        if (canAfford) executeOperation(operation);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "group relative bg-card hover:bg-card/80 border border-border p-4 rounded-lg transition-all duration-300 cursor-pointer overflow-hidden flex flex-col gap-2",
                (!canAfford) && "opacity-50 grayscale cursor-not-allowed",
                isRotten && "border-red-500/50"
            )}
            onClick={handleCardClick}
        >
            {/* Progress Bar Background */}
            {(operation.type === 'QUEST' || operation.type === 'RITUAL') && (
                <div className="absolute top-0 left-0 h-1 bg-black/50 w-full z-10">
                    <div
                        className={cn(
                            "h-full transition-all duration-1000 ease-linear",
                            progress < 50 ? "bg-green-500" : progress < 80 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}


            {/* Delete Action */}
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive z-20 hover:bg-destructive/10 rounded"
                    title="Abolish Protocol"
                >
                    <X className="size-4" />
                </button>
            )}

            <div className="flex justify-between items-center pr-6 mt-1">
                <h3 className="font-serif font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {operation.title}
                </h3>
                {operation.cooldown && (
                    <div className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Clock className="size-3" />
                        <span>{operation.cooldown}s</span>
                    </div>
                )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
                {operation.description}
            </p>

            {/* Footer: Costs & Rewards */}
            <div className="flex items-center justify-between text-xs border-t border-border/50 pt-3 mt-auto">
                {/* Cost */}
                <div className="flex items-center space-x-2 text-red-400">
                    {operation.cost && Object.entries(operation.cost).map(([res, amt]) => (
                        <span key={res} className="flex items-center space-x-1">
                            <span>-{amt}</span>
                            <span className="opacity-50 text-[10px]">{res.slice(0, 3)}</span>
                        </span>
                    ))}
                </div>

                {/* Reward */}
                <div className="flex items-center space-x-3">
                    {operation.rewards?.resources && Object.entries(operation.rewards.resources).map(([res, amt]) => (
                        <span key={res} className="flex items-center space-x-1 text-primary">
                            <span>+{amt}</span>
                            <span className="opacity-50 text-[10px]">{res.slice(0, 3)}</span>
                        </span>
                    ))}
                    {operation.rewards?.threatReduction && Object.entries(operation.rewards.threatReduction).map(([threat, amt]) => (
                        <span key={threat} className="flex items-center space-x-1 text-blue-400">
                            <Skull className="size-3" />
                            <span>-{amt}</span>
                            <span className="opacity-50 text-[10px]">{threat.slice(0, 3)}</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Action Overlay */}
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center pointer-events-none backdrop-blur-[1px]">
                <div className="bg-background text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary shadow-lg flex items-center space-x-2 mb-1">
                    <Check className="size-3" />
                    <span>EXECUTE</span>
                </div>


                {timeLabel && (
                    <div className="bg-black/75 text-white px-2 py-0.5 rounded text-[10px] font-mono">
                        {timeLabel}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
