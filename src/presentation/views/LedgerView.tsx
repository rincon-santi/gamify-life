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

    const [isDrafting, setIsDrafting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [draftTitle, setDraftTitle] = useState("");
    const [draftDesc, setDraftDesc] = useState("");
    const [draftTimeout, setDraftTimeout] = useState<string>(""); // minutes
    const [draftType, setDraftType] = useState<'RITUAL' | 'QUEST' | 'ACTION'>('ACTION');
    const [draftRecurrence, setDraftRecurrence] = useState<string>(""); // hours

    // Thematic Configuration
    const [draftAspect, setDraftAspect] = useState<'STABILITY' | 'COHESION' | 'AMBITION'>('STABILITY');
    const [draftTreasury, setDraftTreasury] = useState<'NEUTRAL' | 'YIELD' | 'GRANT'>('NEUTRAL');
    const [draftImportance, setDraftImportance] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');


    const resetForm = () => {
        setDraftTitle("");
        setDraftDesc("");
        setDraftTimeout("");
        setDraftRecurrence("");
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
        setDraftType(op.type || 'ACTION'); // Fallback for old data
        // For editing, reset config to safe defaults
        setDraftAspect('STABILITY');
        setDraftTreasury('NEUTRAL');
        setDraftImportance('LOW');

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

        // Logic for specific types (Type overrides or additions)
        if (draftType === 'QUEST' && draftTimeout) {
            updates.expiresAt = Date.now() + (parseInt(draftTimeout) * 60 * 1000);
            updates.penalty = { threat: { ENTROPY: 10 * multiplier } };
        } else {
            updates.expiresAt = undefined;
        }

        if (draftType === 'RITUAL' && draftRecurrence) {
            updates.recurrenceInterval = parseInt(draftRecurrence) * 60 * 60 * 1000;
            updates.penalty = { threat: { STAGNATION: 10 * multiplier } };
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
        <div className="h-full flex flex-col space-y-4">
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
                    className="flex items-center space-x-2 bg-primary/10 text-primary border border-primary/50 px-4 py-2 rounded hover:bg-primary/20 transition-colors text-sm font-semibold uppercase tracking-wider"
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
                                    <button
                                        type="button"
                                        onClick={() => setDraftAspect('STABILITY')}
                                        className={`p-2 rounded border text-xs font-bold uppercase transition-all flex items-center justify-between group ${draftAspect === 'STABILITY' ? 'bg-primary/20 border-primary text-primary' : 'border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Shield className={`size-3 ${draftAspect === 'STABILITY' ? 'fill-primary/20' : ''}`} />
                                            <span>Stability</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDraftAspect('COHESION')}
                                        className={`p-2 rounded border text-xs font-bold uppercase transition-all flex items-center justify-between group ${draftAspect === 'COHESION' ? 'bg-primary/20 border-primary text-primary' : 'border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Users className={`size-3 ${draftAspect === 'COHESION' ? 'fill-primary/20' : ''}`} />
                                            <span>Cohesion</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDraftAspect('AMBITION')}
                                        className={`p-2 rounded border text-xs font-bold uppercase transition-all flex items-center justify-between group ${draftAspect === 'AMBITION' ? 'bg-primary/20 border-primary text-primary' : 'border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Crown className={`size-3 ${draftAspect === 'AMBITION' ? 'fill-primary/20' : ''}`} />
                                            <span>Ambition</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Treasury Selector */}
                            <div className="bg-black/20 border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Coins className="size-3" /> Treasury
                                </label>
                                <div className="flex flex-col gap-2 h-full">
                                    <button
                                        type="button"
                                        onClick={() => setDraftTreasury('YIELD')}
                                        className={`p-2 rounded border text-xs font-bold uppercase transition-all flex items-center justify-between ${draftTreasury === 'YIELD' ? 'bg-green-500/20 border-green-500 text-green-500' : 'border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10'}`}
                                    >
                                        <span>Yield</span>
                                        {draftTreasury === 'YIELD' && <div className="size-1.5 rounded-full bg-green-500 shadow-[0_0_5px_currentColor]" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDraftTreasury('GRANT')}
                                        className={`p-2 rounded border text-xs font-bold uppercase transition-all flex items-center justify-between ${draftTreasury === 'GRANT' ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10'}`}
                                    >
                                        <span>Grant</span>
                                        {draftTreasury === 'GRANT' && <div className="size-1.5 rounded-full bg-red-500 shadow-[0_0_5px_currentColor]" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDraftTreasury('NEUTRAL')}
                                        className={`p-2 rounded border text-xs font-bold uppercase transition-all flex items-center justify-between ${draftTreasury === 'NEUTRAL' ? 'bg-primary/20 border-primary text-primary' : 'border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10'}`}
                                    >
                                        <span>Neutral</span>
                                        {draftTreasury === 'NEUTRAL' && <div className="size-1.5 rounded-full bg-primary shadow-[0_0_5px_currentColor]" />}
                                    </button>
                                </div>
                            </div>

                            {/* Importance Selector */}
                            <div className="bg-black/20 border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <AlertCircle className="size-3" /> Importance
                                </label>
                                <div className="flex flex-col gap-2 h-full">
                                    <button
                                        type="button"
                                        onClick={() => setDraftImportance('LOW')}
                                        className={`p-2 rounded border text-xs font-bold uppercase transition-all flex items-center justify-between ${draftImportance === 'LOW' ? 'bg-primary/20 border-primary text-primary' : 'border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="bg-white/10 px-1 rounded text-[10px]">1x</span>
                                            <span>Low</span>
                                        </div>
                                        {draftImportance === 'LOW' && <div className="size-1.5 rounded-full bg-primary shadow-[0_0_5px_currentColor]" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDraftImportance('MEDIUM')}
                                        className={`p-2 rounded border text-xs font-bold uppercase transition-all flex items-center justify-between ${draftImportance === 'MEDIUM' ? 'bg-primary/20 border-primary text-primary' : 'border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="bg-white/10 px-1 rounded text-[10px]">2x</span>
                                            <span>Medium</span>
                                        </div>
                                        {draftImportance === 'MEDIUM' && <div className="size-1.5 rounded-full bg-primary shadow-[0_0_5px_currentColor]" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDraftImportance('HIGH')}
                                        className={`p-2 rounded border text-xs font-bold uppercase transition-all flex items-center justify-between ${draftImportance === 'HIGH' ? 'bg-primary/20 border-primary text-primary' : 'border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="bg-white/10 px-1 rounded text-[10px]">3x</span>
                                            <span>High</span>
                                        </div>
                                        {draftImportance === 'HIGH' && <div className="size-1.5 rounded-full bg-primary shadow-[0_0_5px_currentColor]" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Type Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Operation Type</label>
                        <div className="flex gap-4 py-2">
                            {(['ACTION', 'RITUAL', 'QUEST'] as const).map(t => (
                                <label key={t} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="type"
                                        value={t}
                                        checked={draftType === t}
                                        onChange={() => setDraftType(t)}
                                        className="accent-primary"
                                    />
                                    <span className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">{t}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Conditional Fields */}
                    {draftType === 'QUEST' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground border-b border-border p-2 bg-yellow-900/10 rounded">
                            <Clock className="size-4 text-yellow-500" />
                            <input
                                type="number"
                                placeholder="Deadline (minutes from now)..."
                                className="bg-transparent focus:outline-none w-full placeholder:text-yellow-500/50 text-yellow-500"
                                value={draftTimeout}
                                onChange={e => setDraftTimeout(e.target.value)}
                            />
                        </div>
                    )}

                    {draftType === 'RITUAL' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground border-b border-border p-2 bg-blue-900/10 rounded">
                            <Clock className="size-4 text-blue-500" />
                            <input
                                type="number"
                                placeholder="Recurrence Interval (hours)..."
                                className="bg-transparent focus:outline-none w-full placeholder:text-blue-500/50 text-blue-500"
                                value={draftRecurrence}
                                onChange={e => setDraftRecurrence(e.target.value)}
                            />
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-20">
                {/* Custom Protocols First */}
                {customOperations.map(op => (
                    <div key={op.id} className="relative group hover:z-10 bg-black/20 rounded-lg">
                        <OperationCard
                            operation={op}
                            onDelete={() => deleteOperation(op.id)}
                        />
                        {/* Edit Button - Absolute on top using higher z-index and explicit positioning */}
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
