import { useState } from 'react';
import { useSocietyStore } from '../../application/store';
import { Scroll, Star, Info, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import type { HistoryType } from '../../domain/history';

export function ArchivesView() {
    const history = useSocietyStore((s) => s.history);
    const [filter, setFilter] = useState<HistoryType | 'ALL'>('ALL');

    const filteredHistory = history.filter(entry => filter === 'ALL' || entry.type === filter);

    // Sort reverse chronological
    const sortedHistory = [...filteredHistory].reverse();

    const getIcon = (type: HistoryType) => {
        switch (type) {
            case 'EVENT': return Star;
            case 'ACHIEVEMENT': return CheckCircle;
            case 'TASK': return Scroll;
            case 'THREAT': return AlertTriangle;
            case 'FLAVOR': return MessageSquare;
            default: return Info;
        }
    };

    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleTimeString() + ' ' + new Date(ts).toLocaleDateString();
    };

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-foreground/90">Archives</h2>
                    <p className="text-sm text-muted-foreground">The recorded history of the Covenant.</p>
                </div>

                <div className="flex gap-2">
                    {(['ALL', 'EVENT', 'TASK', 'ACHIEVEMENT', 'THREAT'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filter === f
                                ? 'bg-primary/20 border-primary text-primary'
                                : 'bg-secondary/10 border-transparent text-muted-foreground hover:bg-secondary/20'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {sortedHistory.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground italic">
                        "The pages remain blank..."
                    </div>
                )}

                {sortedHistory.map((entry) => {
                    const Icon = getIcon(entry.type);
                    return (
                        <div
                            key={entry.id}
                            className="bg-card/50 border border-border/30 p-4 rounded-lg flex gap-4 hover:bg-card/80 transition-colors group"
                        >
                            <div className="mt-1 p-2 rounded-full bg-secondary/30 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                <Icon className="size-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-foreground leading-relaxed">{entry.text}</p>
                                <p className="text-xs text-muted-foreground mt-2 font-mono opacity-50 uppercase tracking-widest">
                                    {formatTime(entry.timestamp)} • {entry.type}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
