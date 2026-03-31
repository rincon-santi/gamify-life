import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, AlertTriangle } from "lucide-react";
import { useSocietyStore } from "../../../application/store";
import type { Operation } from "../../../domain/logic";

export function ReportModal() {
    const customOperations = useSocietyStore((s) => s.customOperations);
    const executeOperation = useSocietyStore((s) => s.executeOperation);
    const failOperation = useSocietyStore((s) => s.failOperation);
    const removeOperation = useSocietyStore((s) => s.removeOperation); // For removing completed quests

    const [isOpen, setIsOpen] = useState(false);
    const [pendingOp, setPendingOp] = useState<Operation | null>(null);

    useEffect(() => {
        const checkForExpired = () => {
            if (!customOperations) return;
            const now = Date.now();

            // Find the first actionable item
            const overdueOp = customOperations.find(op => {
                if (op.type === 'ACTION') return false;

                // RITUAL: Check if enough time passed since last completion
                if (op.type === 'RITUAL' && op.recurrenceInterval) {
                    const lastDone = op.lastCompleted || op.createdAt || 0;
                    return (now - lastDone) > op.recurrenceInterval;
                }

                // QUEST: Check if expired and NOT completed
                if (op.type === 'QUEST' && op.expiresAt) {
                    return now > op.expiresAt;
                }

                return false;
            });

            if (overdueOp && !isOpen) {
                setPendingOp(overdueOp);
                setIsOpen(true);
            }
        };

        // Check immediately
        checkForExpired();

        // Check every second for real-time expiration detection
        const interval = setInterval(checkForExpired, 1000);

        return () => clearInterval(interval);
    }, [customOperations, isOpen]);

    const handleConfirm = () => {
        if (pendingOp) {
            executeOperation(pendingOp);
            // If it was a Quest, it is now complete and should be removed from the active list
            // Use removeOperation instead of deleteOperation to avoid applying penalties
            if (pendingOp.type === 'QUEST') {
                removeOperation(pendingOp.id);
            }
        }
        setIsOpen(false);
    };

    const handleDeny = () => {
        if (pendingOp) {
            failOperation(pendingOp.id);
        }
        setIsOpen(false);
    };

    if (!isOpen || !pendingOp) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-card border border-border p-6 max-w-md w-full rounded-lg shadow-2xl relative overflow-hidden"
            >
                {/* Paper Texture Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/assets/texture_paper.png')] bg-cover mix-blend-overlay"></div>

                <DialogHeader className="mb-6 relative z-10">
                    <div className="flex items-center gap-2 text-yellow-500 mb-2">
                        <AlertTriangle className="size-5" />
                        <span className="text-xs uppercase tracking-widest font-bold">Report Required</span>
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-foreground">The Interrogation</h2>
                    <p className="text-muted-foreground mt-2">
                        You have returned. But did you uphold your vows while away?
                    </p>
                </DialogHeader>

                <div className="bg-secondary/50 p-4 rounded border border-border/50 mb-6 relative z-10">
                    <h3 className="font-serif font-semibold text-lg">{pendingOp.title}</h3>
                    <p className="text-sm text-muted-foreground italic">"{pendingOp.description}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <button
                        onClick={handleDeny}
                        className="flex flex-col items-center justify-center p-4 border border-destructive/50 hover:bg-destructive/10 rounded transition-colors group"
                    >
                        <X className="size-6 text-destructive mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-destructive">I FAILED</span>
                        <span className="text-[10px] text-muted-foreground mt-1">Consequences Apply</span>
                    </button>

                    <button
                        onClick={handleConfirm}
                        className="flex flex-col items-center justify-center p-4 border border-primary/50 hover:bg-primary/10 rounded transition-colors group"
                    >
                        <Check className="size-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-primary">IT IS DONE</span>
                        <span className="text-[10px] text-muted-foreground mt-1">Claim Reward</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// Minimal mocked dialog parts for structure if needed
function DialogHeader({ className, children }: any) { return <div className={className}>{children}</div> }
