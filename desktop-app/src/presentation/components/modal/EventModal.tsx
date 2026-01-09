import { motion } from "framer-motion";
import { useSocietyStore } from "../../../application/store";
import { Sparkles, AlertCircle, Quote } from "lucide-react";

export function EventModal() {
    const activeEvent = useSocietyStore((s) => s.activeEvent);
    const resolveEvent = useSocietyStore((s) => s.resolveEvent);

    if (!activeEvent) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-card border border-border p-6 max-w-lg w-full rounded-lg shadow-2xl relative overflow-hidden"
            >
                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/assets/texture_paper.png')] bg-cover mix-blend-overlay"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        {activeEvent.isReliefEvent ? (
                            <Sparkles className="size-5 text-yellow-400" />
                        ) : (
                            <AlertCircle className="size-5 text-primary" />
                        )}
                        <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                            {activeEvent.isReliefEvent ? "Opportunity" : "Event"}
                        </span>
                    </div>

                    <h2 className="text-2xl font-serif font-bold text-foreground mb-4">{activeEvent.title}</h2>

                    <div className="bg-secondary/30 p-4 rounded-md border border-border/50 mb-6 relative">
                        <Quote className="absolute top-2 left-2 size-4 text-muted-foreground/50 opacity-50" />
                        <p className="text-sm text-foreground/90 italic pl-6 leading-relaxed">
                            {activeEvent.description}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {activeEvent.choices.map((choice) => (
                            <button
                                key={choice.id}
                                onClick={() => resolveEvent(choice.id)}
                                className="w-full text-left p-4 rounded border border-border bg-card hover:bg-secondary/40 hover:border-primary/50 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10">
                                    <div className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                                        {choice.label}
                                    </div>
                                    {choice.description && (
                                        <div className="text-xs text-muted-foreground">
                                            {choice.description}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
