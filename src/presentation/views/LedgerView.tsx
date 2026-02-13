import { useState } from "react";
import { Plus, Edit2, Clock, Shield, Users, Crown, Coins, AlertCircle } from "lucide-react";
import type { Operation } from "../../domain/logic";
import { OperationCard } from "../components/ledger/OperationCard";
import { useSocietyStore } from "../../application/store";

const STANDARD_PROTOCOLS: Operation[] = [
    {
        id: 'std_1',
        title: 'Maintain Hygiene',
        description: 'Clean the dishes via standard procedure.',
        type: 'RITUAL',
        recurrenceInterval: 24 * 60 * 60 * 1000,
        rewards: {
            resources: { ORDER: 5 },
            threatReduction: { ENTROPY: 2 }
        }
    },
    {
        id: 'std_2',
        title: 'Diplomatic Call',
        description: 'Establish contact with ally.',
        type: 'ACTION',
        rewards: {
            resources: { CONNECTION: 10 },
            threatReduction: { SOLITUDE: 5 }
        },
        cost: { INFLUENCE: 1 }
    },
    {
        id: 'std_3',
        title: 'Deep Work Session',
        description: 'Focus mind on the Great Work.',
        type: 'ACTION',
        rewards: {
            resources: { INFLUENCE: 15, ORDER: 2 },
            threatReduction: { STAGNATION: 10 }
        }
    }
];

export function LedgerView() {
    const customOperations = useSocietyStore((s) => s.customOperations) || [];
    const createOperation = useSocietyStore((s) => s.createOperation);
    const deleteOperation = useSocietyStore((s) => s.deleteOperation);
    const editOperation = useSocietyStore((s) => s.editOperation);

    // Tutorial Highlighting
    const isTutorialActive = useSocietyStore((s) => s.isTutorialActive);
    const tutorialStep = useSocietyStore((s) => s.tutorialStep);
    // We import STEPS dynamically or check specific ID string to avoid circular dependency if STEPS involves components (it doesn't, but let's be safe)
    // Actually STEPS is in TutorialOverlay. importing it here is fine.
    // But to avoid cyclical imports if TutorialOverlay imports LedgerView (it doesn't), we are safe.
    // However, Shell imports both. TutorialOverlay imports store.

    const highlightDraft = isTutorialActive && tutorialStep === 4; // Hardcoded index for simplicity or we can check ID properly if we export STEPS safely.
    // Let's assume we won't import STEPS to avoid potential cycle if refactored later.
    // 4 is the new "Drafting" step index.

    const [isDrafting, setIsDrafting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [draftTitle, setDraftTitle] = useState("");
    const [draftDesc, setDraftDesc] = useState("");
    const [draftType, setDraftType] = useState<'RITUAL' | 'QUEST' | 'ACTION'>('ACTION');
    const [draftDuration, setDraftDuration] = useState({ days: "", hours: "", minutes: "" }); // Unified duration state

    // Thematic Configuration
    const [draftAspect, setDraftAspect] = useState<'STABILITY' | 'COHESION' | 'AMBITION'>('STABILITY');
    const [draftTreasury, setDraftTreasury] = useState<'NEUTRAL' | 'YIELD' | 'GRANT'>('NEUTRAL');
    const [draftImportance, setDraftImportance] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');


    const resetForm = () => {
        setDraftTitle("");
        setDraftDesc("");
        setDraftDuration({ days: "", hours: "", minutes: "" });
        setDraftType('ACTION');
        setDraftAspect('STABILITY');
        setDraftTreasury('NEUTRAL');
        setDraftImportance('LOW');
        setEditingId(null);
        setIsDrafting(false);
    }

    const handleEditStart = (op: Operation) => {
        setDraftTitle(op.title);
        setDraftDesc(op.description);
        setDraftType(op.type || 'ACTION');
        // For editing, reset config to safe defaults
        setDraftAspect('STABILITY');
        setDraftTreasury('NEUTRAL');
        setDraftImportance('LOW');

        // Reset duration on edit start (user sets new deadline/interval if needed)
        setDraftDuration({ days: "", hours: "", minutes: "" });

        setEditingId(op.id);
        setIsDrafting(true);
    };

    const handleDraft = (e: React.FormEvent) => {
        e.preventDefault();
        if (!draftTitle) return;

        // Multipliers: Low=1x, Medium=2x, High=3x
        const multiplier = draftImportance === 'HIGH' ? 3 : (draftImportance === 'MEDIUM' ? 2 : 1);

        // 1. Base Effects from Aspect
        let rewards: any = {
            resources: {},
            threatReduction: { STAGNATION: 2 * multiplier } // Universal benefit
        };
        let cost: any = {};

        switch (draftAspect) {
            case 'STABILITY':
                rewards.resources.ORDER = 5 * multiplier;
                rewards.threatReduction.ENTROPY = 5 * multiplier;
                break;
            case 'COHESION':
                rewards.resources.CONNECTION = 5 * multiplier;
                rewards.threatReduction.SOLITUDE = 5 * multiplier;
                break;
            case 'AMBITION':
                // Pure stagnation focus, already handled by universal + type specifics potentially
                break;
        }

        // 2. Treasury Effects
        switch (draftTreasury) {
            case 'YIELD':
                rewards.resources.INFLUENCE = 5 * multiplier;
                break;
            case 'GRANT':
                cost.INFLUENCE = 2 * multiplier;
                break;
            case 'NEUTRAL':
                // No change
                break;
        }


        const updates: Partial<Operation> = {
            title: draftTitle,
            description: draftDesc || "A custom decree.",
            type: draftType,
            rewards,
            cost: Object.keys(cost).length > 0 ? cost : undefined
        };

        // Calculate total duration in milliseconds
        const d = parseInt(draftDuration.days || "0");
        const h = parseInt(draftDuration.hours || "0");
        const m = parseInt(draftDuration.minutes || "0");
        const totalMs = ((d * 24 * 60) + (h * 60) + m) * 60 * 1000;

        // Logic for specific types (Type overrides or additions)
        if (draftType === 'QUEST') {
            // Default to 1 hour if valid duration not provided
            const duration = totalMs > 0 ? totalMs : (60 * 60 * 1000);
            updates.expiresAt = Date.now() + duration;
            updates.penalty = { threat: rewards.threatReduction ? { ...rewards.threatReduction } : undefined };
        } else {
            updates.expiresAt = undefined;
        }

        if (draftType === 'RITUAL') {
            // Default to 24 hours if valid duration not provided
            const interval = totalMs > 0 ? totalMs : (24 * 60 * 60 * 1000);
            updates.recurrenceInterval = interval;
            updates.penalty = { threat: rewards.threatReduction ? { ...rewards.threatReduction } : undefined };
        } else {
            updates.recurrenceInterval = undefined;
        }

        if (editingId) {
            editOperation(editingId, updates);
        } else {
            const newOp: Operation = {
                id: crypto.randomUUID(),
                isCustom: true,
                createdAt: Date.now(),
                ...updates
            } as Operation;
            createOperation(newOp);
        }
        resetForm();
    };

    return (
        <div className="flex flex-col space-y-4">
            <header className="flex items-center justify-between border-b border-border/50 pb-4">
                <div>
                    <h2 className="text-3xl font-serif text-primary">The Ledger</h2>
                    <p className="text-muted-foreground text-sm">Review standard protocols or define new ones.</p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setIsDrafting(!isDrafting);
                    }}
                    className={`flex items-center space-x-2 bg-primary/10 text-primary border border-primary/50 px-4 py-2 rounded hover:bg-primary/20 transition-colors text-sm font-semibold uppercase tracking-wider ${highlightDraft ? 'z-[2000] relative ring-2 ring-primary shadow-[0_0_50px_rgba(0,0,0,0.8)]' : ''}`}
                >
                    <Plus className="size-4" />
                    <span>{isDrafting ? "Cancel" : "Draft Decree"}</span>
                </button>
            </header>

            {isDrafting && (
                <form onSubmit={handleDraft} className="bg-card border border-border p-4 rounded-lg animate-in fade-in slide-in-from-top-2 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
                        <span>{editingId ? "Amending Protocol" : "New Decree"}</span>
                    </div>

                    {/* Common Fields */}
                    <input
                        autoFocus
                        type="text"
                        placeholder="Protocol Title..."
                        className="w-full bg-transparent border-b border-border p-2 focus:outline-none focus:border-primary font-serif text-lg"
                        value={draftTitle}
                        onChange={e => setDraftTitle(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Description (Optional)..."
                        className="w-full bg-transparent border-b border-border p-2 focus:outline-none focus:border-primary text-sm text-muted-foreground"
                        value={draftDesc}
                        onChange={e => setDraftDesc(e.target.value)}
                    />

                    <div className="space-y-4">
                        {/* Configuration Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Aspect Selector */}
                            <div className="bg-black/20 border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Shield className="size-3" /> Aspect
                                </label>
                                <div className="flex flex-col gap-2 h-full">
                                    {([
                                        { id: 'STABILITY', icon: Shield, label: 'Stability', desc: 'Prioritizes Order & Entropy reduction.' },
                                        { id: 'COHESION', icon: Users, label: 'Cohesion', desc: 'Prioritizes Connection & Solitude reduction.' },
                                        { id: 'AMBITION', icon: Crown, label: 'Ambition', desc: 'Focuses on Stagnation reduction & generic growth.' }
                                    ] as const).map(aspect => (
                                        <button
                                            key={aspect.id}
                                            type="button"
                                            onClick={() => setDraftAspect(aspect.id)}
                                            className={`relative p-2 rounded border text-xs font-bold uppercase transition-all flex items-center justify-between group/btn ${draftAspect === aspect.id ? 'bg-primary/20 border-primary text-primary' : 'border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <aspect.icon className={`size-3 ${draftAspect === aspect.id ? 'fill-primary/20' : ''}`} />
                                                <span>{aspect.label}</span>
                                            </div>

                                            {/* Hover Tooltip */}
                                            <div className="absolute left-0 -top-10 bg-black border border-white/20 text-white text-[10px] p-2 rounded w-48 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                                                {aspect.desc}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Treasury Selector */}
                            <div className="bg-black/20 border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Coins className="size-3" /> Treasury
                                </label>
                                <div className="flex flex-col gap-2 h-full">
                                    {([
                                        { id: 'YIELD', label: 'Yield', color: 'green-500', desc: 'Generates Influence upon completion.' },
                                        { id: 'GRANT', label: 'Grant', color: 'red-500', desc: 'Costs Influence to perform (Simulates spending).' },
                                        { id: 'NEUTRAL', label: 'Neutral', color: 'primary', desc: 'No Influence cost or gain.' }
                                    ] as const).map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setDraftTreasury(t.id as any)}
                                            className={`relative p-2 rounded border text-xs font-bold uppercase transition-all flex items-center justify-between group/btn ${draftTreasury === t.id ? (t.id === 'YIELD' ? 'bg-green-500/20 border-green-500 text-green-500' : t.id === 'GRANT' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-primary/20 border-primary text-primary') : 'border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10'}`}
                                        >
                                            <span>{t.label}</span>
                                            {draftTreasury === t.id && <div className={`size-1.5 rounded-full bg-${t.color === 'primary' ? 'primary' : t.color} shadow-[0_0_5px_currentColor]`} />}

                                            {/* Hover Tooltip */}
                                            <div className="absolute left-0 -top-10 bg-black border border-white/20 text-white text-[10px] p-2 rounded w-48 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                                                {t.desc}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Importance Selector */}
                            <div className="bg-black/20 border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <AlertCircle className="size-3" /> Importance
                                </label>
                                <div className="flex flex-col gap-2 h-full">
                                    {([
                                        { id: 'LOW', label: 'Low', mult: '1x', desc: 'Standard rewards and efficiency.' },
                                        { id: 'MEDIUM', label: 'Medium', mult: '2x', desc: 'Double rewards. Good for significant tasks.' },
                                        { id: 'HIGH', label: 'High', mult: '3x', desc: 'Triple rewards. Reserved for critical operations.' }
                                    ] as const).map(imp => (
                                        <button
                                            key={imp.id}
                                            type="button"
                                            onClick={() => setDraftImportance(imp.id as any)}
                                            className={`relative p-2 rounded border text-xs font-bold uppercase transition-all flex items-center justify-between group/btn ${draftImportance === imp.id ? 'bg-primary/20 border-primary text-primary' : 'border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="bg-white/10 px-1 rounded text-[10px]">{imp.mult}</span>
                                                <span>{imp.label}</span>
                                            </div>
                                            {draftImportance === imp.id && <div className="size-1.5 rounded-full bg-primary shadow-[0_0_5px_currentColor]" />}

                                            {/* Hover Tooltip */}
                                            <div className="absolute right-0 -top-10 bg-black border border-white/20 text-white text-[10px] p-2 rounded w-48 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                                                {imp.desc}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Type Selector */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Operation Type</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(['ACTION', 'RITUAL', 'QUEST'] as const).map(t => (
                                <label key={t} className={`flex flex-col gap-2 p-3 rounded-lg border cursor-pointer transition-all group ${draftType === t ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'}`}>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="type"
                                            value={t}
                                            checked={draftType === t}
                                            onChange={() => setDraftType(t)}
                                            className="accent-primary size-4"
                                        />
                                        <span className={`text-sm font-bold tracking-wide ${draftType === t ? 'text-primary' : 'text-muted-foreground'}`}>{t}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed pl-6 h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 overflow-hidden transition-all duration-300">
                                        {t === 'ACTION' && "One-time immediate effect. Good for quick adjustments."}
                                        {t === 'RITUAL' && "Recurring maintenance. Must be performed regularly or threats increase."}
                                        {t === 'QUEST' && "High-stakes, single-use objective. Complete before deadline for massive rewards."}
                                    </p>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Conditional Fields */}
                    {(draftType === 'QUEST' || draftType === 'RITUAL') && (
                        <div className={`flex flex-col gap-2 text-sm text-muted-foreground border-b border-border p-2 rounded ${draftType === 'QUEST' ? 'bg-yellow-900/10' : 'bg-blue-900/10'}`}>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                <Clock className={`size-4 ${draftType === 'QUEST' ? 'text-yellow-500' : 'text-blue-500'}`} />
                                <span className={draftType === 'QUEST' ? 'text-yellow-500' : 'text-blue-500'}>
                                    {draftType === 'QUEST' ? 'Deadline Duration' : 'Recurrence Interval'}
                                </span>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 flex flex-col gap-1">
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        className={`bg-black/20 border border-white/5 p-2 rounded text-center focus:outline-none focus:border-primary ${draftType === 'QUEST' ? 'text-yellow-500' : 'text-blue-500'}`}
                                        value={draftDuration.days}
                                        onChange={e => setDraftDuration({ ...draftDuration, days: e.target.value })}
                                    />
                                    <span className="text-[10px] text-center uppercase text-muted-foreground">Days</span>
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                    <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        placeholder="0"
                                        className={`bg-black/20 border border-white/5 p-2 rounded text-center focus:outline-none focus:border-primary ${draftType === 'QUEST' ? 'text-yellow-500' : 'text-blue-500'}`}
                                        value={draftDuration.hours}
                                        onChange={e => setDraftDuration({ ...draftDuration, hours: e.target.value })}
                                    />
                                    <span className="text-[10px] text-center uppercase text-muted-foreground">Hours</span>
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        placeholder="0"
                                        className={`bg-black/20 border border-white/5 p-2 rounded text-center focus:outline-none focus:border-primary ${draftType === 'QUEST' ? 'text-yellow-500' : 'text-blue-500'}`}
                                        value={draftDuration.minutes}
                                        onChange={e => setDraftDuration({ ...draftDuration, minutes: e.target.value })}
                                    />
                                    <span className="text-[10px] text-center uppercase text-muted-foreground">Minutes</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end mt-2 gap-2">
                        <button type="button" onClick={resetForm} className="text-xs text-muted-foreground hover:text-foreground">CANCEL</button>
                        <button type="submit" className="text-xs text-primary hover:underline uppercase font-bold tracking-widest">
                            {editingId ? "Update Entry" : "Confirm Entry"}
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                {/* Custom Protocols First */}
                {customOperations.map(op => (
                    <div key={op.id} className="relative group hover:z-10 bg-black/20 rounded-lg">
                        <OperationCard
                            operation={op}
                            onDelete={() => deleteOperation(op.id)}
                        />
                        {/* Edit Button - Absolute on top using higher z-index and explicit positioning */}
                        {(op.type !== 'QUEST' && op.type !== 'RITUAL') && (
                            <div className="absolute top-2 right-10 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditStart(op);
                                    }}
                                    className="p-1 text-muted-foreground hover:text-primary hover:bg-black/50 rounded backdrop-blur-sm"
                                    title="Edit Protocol"
                                >
                                    <Edit2 className="size-4" />
                                </button>
                            </div>
                        )}

                        {/* Type Badge */}
                        <div className="absolute top-2 left-2 z-20 pointer-events-none">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/50 text-white/50 border border-white/10">
                                {op.type || 'ACTION'}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Standard Protocols */}
                {STANDARD_PROTOCOLS.map(op => (
                    <OperationCard key={op.id} operation={{ ...op, type: 'ACTION' }} />
                ))}
            </div>
        </div>
    );
}
