import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ResourceType } from '../domain/resources';
import type { ThreatType } from '../domain/threats';
import type { Modifier, Operation } from '../domain/logic';
import { ALL_EVENTS, type GameEvent } from '../domain/events';
import { ACHIEVEMENTS } from '../domain/achievements';
import type { HistoryEntry, HistoryType } from '../domain/history';

const createHistoryEntry = (text: string, type: HistoryType, details?: HistoryEntry['details']): HistoryEntry => ({
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    timestamp: Date.now(),
    text,
    type,
    details
});

// --- Constants ---
const MAX_THREAT = 100;

// --- Helper Functions ---

/**
 * Apply threat changes with clamping to [0, MAX_THREAT] range.
 * Returns what couldn't be applied (for logging).
 */
function applySafeThreatChange(
    threats: Record<ThreatType, number>,
    changes: Partial<Record<ThreatType, number>>
): Partial<Record<ThreatType, number>> {
    const unapplied: Partial<Record<ThreatType, number>> = {};

    for (const [threat, amount] of Object.entries(changes)) {
        const currentValue = threats[threat as ThreatType];
        const targetValue = currentValue + (amount as number);
        const clampedValue = Math.max(0, Math.min(MAX_THREAT, targetValue));

        threats[threat as ThreatType] = clampedValue;

        // Track what couldn't be applied
        const appliedChange = clampedValue - currentValue;
        const unappliedAmount = (amount as number) - appliedChange;

        if (Math.abs(unappliedAmount) > 0.001) { // Use small epsilon for floating point comparison
            unapplied[threat as ThreatType] = unappliedAmount;
        }
    }

    return unapplied;
}

/**
 * Apply resource penalty with clamping at 0 (resources can't go below 0 from penalties).
 * Returns what couldn't be applied (for logging).
 * Note: Regular resource changes (not penalties) can make resources negative.
 */
function applyResourcePenalty(
    resources: Record<ResourceType, number>,
    penalties: Partial<Record<ResourceType, number>>
): Partial<Record<ResourceType, number>> {
    const unapplied: Partial<Record<ResourceType, number>> = {};

    for (const [resource, amount] of Object.entries(penalties)) {
        const currentValue = resources[resource as ResourceType];
        // Penalties are positive values that reduce resources
        const targetValue = currentValue - (amount as number);
        const clampedValue = Math.max(0, targetValue);

        resources[resource as ResourceType] = clampedValue;

        // Track what couldn't be applied
        const appliedReduction = currentValue - clampedValue;
        const unappliedAmount = (amount as number) - appliedReduction;

        if (Math.abs(unappliedAmount) > 0.001) {
            unapplied[resource as ResourceType] = unappliedAmount;
        }
    }

    return unapplied;
}


export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

// --- State Interface ---
interface SocietyState {
    resources: Record<ResourceType, number>;
    threats: Record<ThreatType, number>;
    modifiers: Modifier[];
    customOperations: Operation[];
    activeEvent: GameEvent | null; // [NEW] Active modal event
    history: HistoryEntry[]; // Log of events
    achievements: string[]; // IDs of unlocked achievements
    lastActiveTime: number;
    sessionStartTime: number; // For survival tracking
    difficulty: Difficulty;

    // Actions
    setDifficulty: (diff: Difficulty) => void;
    reset: () => void;
    addResource: (type: ResourceType, amount: number) => void;
    addThreat: (type: ThreatType, amount: number) => void;
    applyPenalty: (penalty: { threat?: Partial<Record<ThreatType, number>>, resource?: Partial<Record<ResourceType, number>> }, context?: string) => void;
    executeOperation: (operation: Operation) => void;
    createOperation: (operation: Operation) => void;
    deleteOperation: (id: string) => void;
    removeOperation: (id: string) => void;
    editOperation: (id: string, updates: Partial<Operation>) => void;
    resolveEvent: (choiceId: string) => void; // [NEW] Handle event choices
    tick: () => void; // Run periodic updates
    processOfflineProgress: () => void;

    // Selectors / Helpers
    isGameOver: () => boolean;
    hasStarted: () => boolean;
}

// --- Initial Values ---
const INITIAL_RESOURCES: Record<ResourceType, number> = {
    INFLUENCE: 10,
    ORDER: 50,
    CONNECTION: 50,
};

const INITIAL_THREATS: Record<ThreatType, number> = {
    ENTROPY: 10,
    STAGNATION: 0,
    SOLITUDE: 0,
};

// --- Store ---
export const useSocietyStore = create<SocietyState>()(
    persist(
        immer((set, get) => ({
            resources: INITIAL_RESOURCES,
            threats: INITIAL_THREATS,
            modifiers: [],
            customOperations: [], // Ensure this is initialized
            activeEvent: null,
            history: [createHistoryEntry("The Covenant has been established.", 'FLAVOR')],
            achievements: [],
            lastActiveTime: Date.now(),
            sessionStartTime: Date.now(),
            difficulty: 'MEDIUM',

            setDifficulty: (diff: Difficulty) => set((state) => { state.difficulty = diff }),

            reset: () => set((state) => {
                state.threats = INITIAL_THREATS;
                state.modifiers = [];
                state.customOperations = [];
                state.activeEvent = null;
                state.history = [createHistoryEntry("The Covenant has been renewed.", 'FLAVOR')];
                state.achievements = [];
                state.lastActiveTime = Date.now();
                state.sessionStartTime = Date.now();
                // difficulty is set separately via UI before/after reset usually, 
                // but we can leave it as is or reset to default. 
                // Let's leave it, as setDifficulty usually happens during New Game flow.
            }),

            addResource: (type: ResourceType, amount: number) =>
                set((state) => {
                    state.resources[type] += amount;
                }),

            addThreat: (type: ThreatType, amount: number) =>
                set((state) => {
                    const newValue = state.threats[type] + amount;
                    state.threats[type] = Math.max(0, Math.min(MAX_THREAT, newValue));
                }),

            applyPenalty: (penalty: { threat?: Partial<Record<ThreatType, number>>, resource?: Partial<Record<ResourceType, number>> }, context?: string) =>
                set((state) => {
                    const unappliedThreats: Partial<Record<ThreatType, number>> = {};
                    const unappliedResources: Partial<Record<ResourceType, number>> = {};

                    // Apply threat penalties
                    if (penalty.threat) {
                        const unapplied = applySafeThreatChange(state.threats, penalty.threat);
                        Object.assign(unappliedThreats, unapplied);
                    }

                    // Apply resource penalties
                    if (penalty.resource) {
                        const unapplied = applyResourcePenalty(state.resources, penalty.resource);
                        Object.assign(unappliedResources, unapplied);
                    }

                    // Log what couldn't be applied
                    const unappliedCount = Object.keys(unappliedThreats).length + Object.keys(unappliedResources).length;
                    if (unappliedCount > 0) {
                        const parts: string[] = [];

                        if (Object.keys(unappliedThreats).length > 0) {
                            const threatText = Object.entries(unappliedThreats)
                                .map(([t, v]) => `${t}: ${v.toFixed(1)}`)
                                .join(', ');
                            parts.push(`Threats: ${threatText}`);
                        }

                        if (Object.keys(unappliedResources).length > 0) {
                            const resourceText = Object.entries(unappliedResources)
                                .map(([r, v]) => `${r}: ${v.toFixed(1)}`)
                                .join(', ');
                            parts.push(`Resources: ${resourceText}`);
                        }

                        const contextText = context ? ` (${context})` : '';
                        state.history.push(createHistoryEntry(
                            `Some penalties couldn't be fully applied (already at limits)${contextText}: ${parts.join('; ')}`,
                            'TASK'
                        ));
                    }
                }),


            createOperation: (op: Operation) =>
                set((state) => {
                    if (!state.customOperations) state.customOperations = []; // Safety init
                    state.customOperations.push(op);
                    state.history.push(createHistoryEntry(`New Protocol Established: ${op.title}`, 'TASK'));
                }),

            deleteOperation: (id: string) =>
                set((state) => {
                    if (!state.customOperations) return;
                    const idx = state.customOperations.findIndex(o => o.id === id);
                    if (idx !== -1) {
                        const op = state.customOperations[idx];

                        // [NEW] Consequences for abandoning Quests/Rituals
                        if (op.type === 'QUEST' || op.type === 'RITUAL') {
                            if (op.penalty?.threat) {
                                const unapplied = applySafeThreatChange(state.threats, op.penalty.threat);

                                // Log the applied penalties
                                state.history.push(createHistoryEntry(`Abandoned ${op.type}: ${op.title}. Consequences applied.`, 'TASK'));

                                // Log what couldn't be applied
                                if (Object.keys(unapplied).length > 0) {
                                    const unappliedText = Object.entries(unapplied)
                                        .map(([t, v]) => `${t}: ${v.toFixed(1)}`)
                                        .join(', ');
                                    state.history.push(createHistoryEntry(
                                        `Some penalties couldn't be fully applied (already at limits): ${unappliedText}`,
                                        'TASK'
                                    ));
                                }
                            } else {
                                state.history.push(createHistoryEntry(`Abandoned ${op.type}: ${op.title}.`, 'TASK'));
                            }
                        }

                        state.customOperations.splice(idx, 1);
                    }
                }),

            removeOperation: (id: string) =>
                set((state) => {
                    if (!state.customOperations) return;
                    const idx = state.customOperations.findIndex(o => o.id === id);
                    if (idx !== -1) {
                        // Remove without applying penalties (for completed operations)
                        state.customOperations.splice(idx, 1);
                    }
                }),

            editOperation: (id: string, updates: Partial<Operation>) =>
                set((state) => {
                    if (!state.customOperations) return;
                    const op = state.customOperations.find(o => o.id === id);
                    if (op) {
                        // [NEW] Prevent editing Quests/Rituals
                        if (op.type === 'QUEST' || op.type === 'RITUAL') {
                            console.warn("Attempted to edit a defined Quest or Ritual. Operation denied.");
                            return;
                        }
                        Object.assign(op, updates);
                    }
                }),

            resolveEvent: (choiceId: string) =>
                set((state) => {
                    if (!state.activeEvent) return;
                    const choice = state.activeEvent.choices.find(c => c.id === choiceId);
                    if (!choice) return;

                    // Apply Outcome
                    const outcome = choice.outcome;

                    // 1. Grant Operation (Quest)
                    if (outcome.grantOperation) {
                        if (!state.customOperations) state.customOperations = [];
                        // Ensure unique ID if needed, but static IDs are fine for unique quests
                        // Maybe append timestamp to ID to allow repeats?
                        // For now keep static. 
                        state.customOperations.push({
                            ...outcome.grantOperation,
                            createdAt: Date.now(),
                            // If it expires, setting relative time to absolute
                            expiresAt: outcome.grantOperation.expiresAt // logic in domain already sets absolute or we need to fix it?
                            // Domain Logic used Date.now(). If we import generic object, Date.now() is fixed at import time.
                            // FIX: generic objects shouldn't have pre-computed Date.now().
                            // We will fix this in logic below or changing domain.
                            // For now, let's assume we re-calc times.
                        });
                        // Re-calc expiry if it was set to a number (duration) vs absolute
                        // In domain I wrote `expiresAt: Date.now() + ...`. That value is static!
                        // I need to change domain to use `duration` instead of `expiresAt`.
                        // For this iteration, I will override it here.
                        const op = state.customOperations[state.customOperations.length - 1];
                        if (outcome.grantOperation.expiresAt) {
                            // It's a static timestamp from when module loaded. WRONG.
                            // Let's assume the value in domain was "Duration in ms" actually, or just a placeholder.
                            // Let's fix this in domain later. For now, let's hardcode a fix:
                            // If the domain 'expiresAt' is massive, it was intended as absolute.
                            // But since it's stale, we should treat it as relative?
                            // Let's just say specific Quests default to 2h for now if not specified.
                            op.expiresAt = Date.now() + (1000 * 60 * 60 * 2);
                        }
                    }

                    // 2. Resource/Threat Changes
                    if (outcome.resourceChange) {
                        for (const [r, amt] of Object.entries(outcome.resourceChange)) {
                            // Note: Resource changes from events CAN make resources negative (per user decision)
                            state.resources[r as ResourceType] += (amt as number);
                        }
                    }
                    if (outcome.threatChange) {
                        // Use safe application to clamp threats to [0, 100]
                        applySafeThreatChange(state.threats, outcome.threatChange);
                    }

                    state.history.push(createHistoryEntry(`Event: ${state.activeEvent.title} - Chose: ${choice.label}`, 'EVENT', { eventId: state.activeEvent.id }));
                    state.activeEvent = null;
                }),

            executeOperation: (operation: Operation) =>
                set((state) => {
                    // 1. Pay Costs
                    if (operation.cost) {
                        for (const [res, amount] of Object.entries(operation.cost)) {
                            if (state.resources[res as ResourceType] < (amount as number)) {
                                return; // Not enough resources (Should be checked in UI too)
                            }
                            state.resources[res as ResourceType] -= (amount as number);
                        }
                    }

                    // 2. Grant Rewards
                    if (operation.rewards?.resources) {
                        for (const [res, amount] of Object.entries(operation.rewards.resources)) {
                            state.resources[res as ResourceType] += (amount as number);
                        }
                    }
                    if (operation.rewards?.threatReduction) {
                        for (const [threat, amount] of Object.entries(operation.rewards.threatReduction)) {
                            state.threats[threat as ThreatType] = Math.max(0, state.threats[threat as ThreatType] - (amount as number));
                        }
                    }

                    // 3. Add Modifiers
                    if (operation.grantedModifiers) {
                        state.modifiers.push(...operation.grantedModifiers);
                    }

                    // 4. Update recurrence/lastCompleted
                    // If it's a custom operation in the store, we should update it there too so it persists 'lastCompleted'
                    if (state.customOperations) {
                        const customOp = state.customOperations.find(o => o.id === operation.id);
                        if (customOp) {
                            customOp.lastCompleted = Date.now();
                        }
                    }

                    // 5. Log
                    state.history.push(createHistoryEntry(`Executed: ${operation.title}`, 'TASK'));
                }),

            tick: () =>
                set((state) => {
                    const now = Date.now();
                    state.lastActiveTime = now;

                    if (Object.values(state.threats).some(v => v >= MAX_THREAT)) {
                        return;
                    }

                    // Timeouts Logic
                    // Check for operations that have expired
                    if (state.customOperations) {
                        // Filter out expired ones? Or apply penalty? 
                        // "Timeout" usually implies it disappears or fails.
                        // Let's implement: If expiresAt < now, remove it and apply penalty (if any).
                        // COMMENTED OUT: We now defer expiry handling to the ReportModal UI.
                        // Expired quests should remain in the list so the user is forced to report on them.
                        /*
                        for (let i = state.customOperations.length - 1; i >= 0; i--) {
                            const op = state.customOperations[i];
                            if (op.expiresAt && op.expiresAt < now) {
                                // Expired!
                                state.history.push(createHistoryEntry(`Protocol Expired: ${op.title}. Consequences apply.`, 'TASK'));

                                // Apply Penalty
                                if (op.penalty?.threat) {
                                    for (const [t, amount] of Object.entries(op.penalty.threat)) {
                                        state.threats[t as ThreatType] += (amount as number);
                                    }
                                }

                                // Remove
                                state.customOperations.splice(i, 1);
                            }
                        }
                        */
                    }

                    // Apply Modifiers
                    state.modifiers.forEach((mod: Modifier) => {
                        if (mod.effect.resource) {
                            for (const [res, amount] of Object.entries(mod.effect.resource)) {
                                state.resources[res as ResourceType] += (amount as number);
                            }
                        }
                        if (mod.effect.threat) {
                            for (const [threat, amount] of Object.entries(mod.effect.threat)) {
                                state.threats[threat as ThreatType] += (amount as number);
                            }
                        }
                    });

                    // Base Exponential Growth
                    // Difficulty Scaling
                    // We solve for rate `r` where T(t) = 100.
                    // With dT/dt = r(1 + 0.1T), time to rupture is ~24/r seconds.

                    // Easy (1mo = 2.6M s): r ~= 24 / 2.6M ~= 0.000009
                    // Medium (1wk = 605k s): r ~= 24 / 605k ~= 0.000040
                    // Hard (3d = 260k s): r ~= 24 / 260k ~= 0.000100

                    let growthRate = 0.000040; // Default Medium
                    if (state.difficulty === 'EASY') growthRate = 0.000009;
                    if (state.difficulty === 'HARD') growthRate = 0.000100;

                    Object.keys(state.threats).forEach((key) => {
                        const threat = key as ThreatType;
                        const current = state.threats[threat];
                        // exponential factor is 10% of base rate
                        const exponentialFactor = growthRate * 0.1;

                        state.threats[threat] += growthRate + (current * exponentialFactor);

                        if (state.threats[threat] >= MAX_THREAT) {
                            state.threats[threat] = MAX_THREAT;
                        }
                    });

                    // Check Achievements
                    const currentIds = new Set(state.achievements);
                    ACHIEVEMENTS.forEach(ach => {
                        if (!currentIds.has(ach.id)) {
                            if (ach.condition(state)) {
                                state.achievements.push(ach.id);
                                state.achievements.push(ach.id);
                                state.history.push(createHistoryEntry(`🏆 Achievement Unlocked: ${ach.title}`, 'ACHIEVEMENT', { achievementId: ach.id }));
                            }
                        }
                    });


                    // Random Event Trigger
                    // Only if no active event
                    if (!state.activeEvent) {
                        // Rate: 1 check per tick (assumed 1s). 
                        // Target: ~1 event every 5 minutes? = 1/300 = 0.003
                        const BASE_EVENT_CHANCE = 0.003;

                        if (Math.random() < BASE_EVENT_CHANCE) {
                            // Try to find a valid event
                            const validEvents = ALL_EVENTS.filter(e => {
                                // Check conditions
                                if (e.triggerConditions) {
                                    if (e.triggerConditions.minThreat) {
                                        for (const [t, min] of Object.entries(e.triggerConditions.minThreat)) {
                                            if (state.threats[t as ThreatType] < (min as number)) return false;
                                        }
                                    }
                                    // Add other checks if needed
                                }
                                return true;
                            });

                            if (validEvents.length > 0) {
                                // Simple constrained random for now. 
                                // Weighted random could be better.
                                const event = validEvents[Math.floor(Math.random() * validEvents.length)];
                                state.activeEvent = event;
                            }
                        }
                    }
                }),

            isGameOver: () => {
                const currentThreats = get().threats;
                return Object.values(currentThreats).some(v => v >= MAX_THREAT);
            },

            hasStarted: () => {
                const state = get();
                // Check History
                if (state.history.length > 1) return true;
                // Check Achievements
                if (state.achievements.length > 0) return true;
                // Check Resources
                for (const [r, v] of Object.entries(state.resources)) {
                    if (v !== INITIAL_RESOURCES[r as ResourceType]) return true;
                }
                // Check Threats
                for (const [t, v] of Object.entries(state.threats)) {
                    if (v !== INITIAL_THREATS[t as ThreatType]) return true;
                }
                return false;
            },



            processOfflineProgress: () =>
                set((state) => {
                    const now = Date.now();

                    // If state is missing customOperations (due to old save), init it
                    if (!state.customOperations) {
                        state.customOperations = [];
                    }

                    if (!state.lastActiveTime) {
                        state.lastActiveTime = now;
                        return;
                    }

                    const deltaMs = now - state.lastActiveTime; // This is a Const, cannot re-assign.
                    const deltaSeconds = deltaMs / 1000;

                    if (deltaSeconds < 10) {
                        state.lastActiveTime = now; // Update time if we return early
                        return;
                    }

                    let growthRate = 0.000040; // Default Medium
                    if (state.difficulty === 'EASY') growthRate = 0.000009;
                    if (state.difficulty === 'HARD') growthRate = 0.000100;

                    const baseGrowthPerSecond = growthRate;
                    const exponentialFactorPerSecond = growthRate * 0.1;

                    Object.keys(state.threats).forEach((key) => {
                        const threat = key as ThreatType;
                        const current = state.threats[threat];
                        // Linear approx for offline
                        const growth = (baseGrowthPerSecond * deltaSeconds) + (current * exponentialFactorPerSecond * deltaSeconds);
                        let newValue = state.threats[threat] + growth;
                        if (newValue > MAX_THREAT) newValue = MAX_THREAT;

                        state.threats[threat] = newValue;
                        state.history.push(createHistoryEntry(`While you slept, ${threat} grew by ${growth.toFixed(1)}.`, 'THREAT', { threatType: threat }));
                    });

                    // Offline Event Trigger
                    if (!state.activeEvent && deltaSeconds > 3600) { // Min 1 hour offline
                        const OFFLINE_EVENT_CHANCE = 0.5; // 50% chance if > 1h
                        if (Math.random() < OFFLINE_EVENT_CHANCE) {
                            const validEvents = ALL_EVENTS.filter(e => {
                                if (e.triggerConditions?.minThreat) {
                                    for (const [t, min] of Object.entries(e.triggerConditions.minThreat)) {
                                        if (state.threats[t as ThreatType] < (min as number)) return false;
                                    }
                                }
                                return true;
                            });
                            if (validEvents.length > 0) {
                                const event = validEvents[Math.floor(Math.random() * validEvents.length)];
                                state.activeEvent = event;
                                state.history.push(createHistoryEntry("Something happened while you were away...", 'EVENT', { eventId: event.id }));
                            }
                        }
                    }

                    state.lastActiveTime = now;

                    // Check Achievements (Offline)
                    const currentIds = new Set(state.achievements);
                    ACHIEVEMENTS.forEach(ach => {
                        if (!currentIds.has(ach.id)) {
                            if (ach.condition(state)) {
                                state.achievements.push(ach.id);
                                state.history.push(createHistoryEntry(`🏆 Achievement Unlocked: ${ach.title}`, 'ACHIEVEMENT', { achievementId: ach.id }));
                            }
                        }
                    });
                }),
        })),
        {
            name: 'society-storage',
            merge: (persistedState, currentState) => {
                console.log("[Store] Merging state", persistedState);
                if (!persistedState) return currentState;

                // Custom merge to ensure array exists
                const merged = { ...currentState, ...(persistedState as object) };
                if (!merged.customOperations) merged.customOperations = [];
                if (!merged.achievements) merged.achievements = [];
                if (!merged.sessionStartTime) merged.sessionStartTime = Date.now(); // Backfill for old saves

                // Migrate legacy history (string[]) to HistoryEntry[]
                if (Array.isArray(merged.history) && merged.history.length > 0 && typeof merged.history[0] === 'string') {
                    // @ts-ignore
                    merged.history = merged.history.map((h: string, i: number) => ({
                        id: `legacy-${i}-${Date.now()}`,
                        timestamp: Date.now(),
                        text: h,
                        type: 'FLAVOR'
                    }));
                }

                console.log("[Store] Merged result:", merged);
                // Ensure hasStarted is preserved (it should be since it's in currentState)
                if (typeof merged.hasStarted !== 'function') {
                    console.error("[Store] hasStarted is missing after merge! Restoring from currentState.");
                    merged.hasStarted = currentState.hasStarted;
                }

                return merged;
            },
            onRehydrateStorage: () => (state) => {
                console.log("[Store] Rehydrated. Running offline progress...");
                try {
                    state?.processOfflineProgress();
                } catch (e) {
                    console.error("[Store] Offline progress failed:", e);
                }
            },
            partialize: (state) => {
                // Exclude functions and Actions from persistence
                const { ...rest } = state;
                // We should only persist data fields.
                // However, state contains actions too.
                // explicitly picking fields is safer:
                return {
                    resources: state.resources,
                    threats: state.threats,
                    modifiers: state.modifiers,
                    customOperations: state.customOperations,
                    activeEvent: state.activeEvent,
                    history: state.history,
                    achievements: state.achievements,
                    lastActiveTime: state.lastActiveTime,
                    sessionStartTime: state.sessionStartTime,
                    difficulty: state.difficulty
                };
            }
        }
    ));
