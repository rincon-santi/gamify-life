import { useState } from 'react';
import { ACHIEVEMENTS, type AchievementCategory } from '../../domain/achievements';
import { useSocietyStore } from '../../application/store';
import { Trophy, Lock, X, Star, Skull, DollarSign, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES: AchievementCategory[] = ['WEALTH', 'SURVIVAL', 'RISK', 'RECOVERY', 'EVENT', 'SPECIAL'];

interface AchievementsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AchievementsPanel({ isOpen, onClose }: AchievementsPanelProps) {
    const [activeTab, setActiveTab] = useState<AchievementCategory>('WEALTH');
    const unlockedIds = useSocietyStore((s) => s.achievements);
    const unlockedSet = new Set(unlockedIds);

    const getIcon = (category: AchievementCategory) => {
        switch (category) {
            case 'WEALTH': return DollarSign;
            case 'SURVIVAL': return Activity;
            case 'RISK': return Skull;
            case 'RECOVERY': return Zap;
            case 'EVENT': return Star;
            case 'SPECIAL': return Trophy;
            default: return Trophy;
        }
    };

    const filteredAchievements = ACHIEVEMENTS.filter(a => a.category === activeTab);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card w-full max-w-4xl h-[80vh] rounded-xl border border-border shadow-2xl flex flex-col overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/20">
                            <div className="flex items-center gap-3">
                                <Trophy className="size-6 text-yellow-500" />
                                <div>
                                    <h2 className="text-xl font-bold font-serif">Hall of Records</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Unlocked: {unlockedIds.length} / {ACHIEVEMENTS.length}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-secondary rounded-full transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar */}
                            <div className="w-48 bg-secondary/10 border-r border-border p-2 space-y-1">
                                {CATEGORIES.map(cat => {
                                    const Icon = getIcon(cat);
                                    const isActive = activeTab === cat;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveTab(cat)}
                                            className={`w-full flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                                                }`}
                                        >
                                            <Icon className="size-4" />
                                            <span className="capitalize">{cat.toLowerCase()}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 bg-background/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredAchievements.map(ach => {
                                        const isUnlocked = unlockedSet.has(ach.id);
                                        const Icon = getIcon(ach.category);

                                        return (
                                            <div
                                                key={ach.id}
                                                className={`p-4 rounded-lg border flex items-start gap-4 transition-all ${isUnlocked
                                                        ? 'bg-card border-yellow-500/20 shadow-sm'
                                                        : 'bg-secondary/20 border-border/50 opacity-60 grayscale'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-full ${isUnlocked ? 'bg-yellow-500/10 text-yellow-500' : 'bg-secondary text-muted-foreground'}`}>
                                                    {isUnlocked ? <Icon className="size-5" /> : <Lock className="size-5" />}
                                                </div>
                                                <div>
                                                    <h3 className={`font-semibold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {ach.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1 leading-snug">
                                                        {isUnlocked || !ach.isHidden ? ach.description : '???'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
