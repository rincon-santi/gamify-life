import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ResourceType } from '../domain/resources';
import type { ThreatType } from '../domain/threats';
import type { Modifier, Operation } from '../domain/logic';

// --- Constants ---
const MAX_THREAT = 100;

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

// --- State Interface ---
interface SocietyState {
    resources: Record<ResourceType, number>;
    threats: Record<ThreatType, number>;
    modifiers: Modifier[];
    customOperations: Operation[];
    history: string[]; // Log of events
    lastActiveTime: number;
    difficulty: Difficulty;

    // Actions
    setDifficulty: (diff: Difficulty) => void;
    reset: () => void;
    addResource: (type: ResourceType, amount: number) => void;
    addThreat: (type: ThreatType, amount: number) => void;
    executeOperation: (operation: Operation) => void;
    createOperation: (operation: Operation) => void;
    deleteOperation: (id: string) => void;
    editOperation: (id: string, updates: Partial<Operation>) => void;
    tick: () => void; // Run periodic updates
    processOfflineProgress: () => void;

    // Selectors / Helpers
    isGameOver: () => boolean;
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
            history: ["The Covenant has been established."],
            lastActiveTime: Date.now(),
            difficulty: 'MEDIUM',

            setDifficulty: (diff: Difficulty) => set((state) => { state.difficulty = diff }),

            reset: () => set((state) => {
                state.resources = INITIAL_RESOURCES;
                state.threats = INITIAL_THREATS;
                state.modifiers = [];
                state.customOperations = [];
                state.history = ["The Covenant has been renewed."];
                state.lastActiveTime = Date.now();
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
                    state.threats[type] += amount;
                }),

            createOperation: (op: Operation) =>
                set((state) => {
                    if (!state.customOperations) state.customOperations = []; // Safety init
                    state.customOperations.push(op);
                    state.history.push(`New Protocol Established: ${op.title}`);
                }),

            deleteOperation: (id: string) =>
                set((state) => {
                    if (!state.customOperations) return;
                    const idx = state.customOperations.findIndex(o => o.id === id);
                    if (idx !== -1) {
                        state.customOperations.splice(idx, 1);
                    }
                }),

            editOperation: (id: string, updates: Partial<Operation>) =>
                set((state) => {
                    if (!state.customOperations) return;
                    const op = state.customOperations.find(o => o.id === id);
                    if (op) {
                        Object.assign(op, updates);
                    }
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
                    state.history.push(`Executed: ${operation.title}`);
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
                        for (let i = state.customOperations.length - 1; i >= 0; i--) {
                            const op = state.customOperations[i];
                            if (op.expiresAt && op.expiresAt < now) {
                                // Expired!
                                state.history.push(`Protocol Expired: ${op.title}. Consequences apply.`);

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
                }),

            isGameOver: () => {
                const currentThreats = get().threats;
                return Object.values(currentThreats).some(v => v >= MAX_THREAT);
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

                    const deltaMs = now - state.lastActiveTime;
                    const deltaSeconds = deltaMs / 1000;

                    if (deltaSeconds < 10) return;

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
                        state.history.push(`While you slept, ${threat} grew by ${growth.toFixed(1)}.`);
                    });

                    state.lastActiveTime = now;
                }),
        })),
        {
            name: 'society-storage',
            merge: (persistedState, currentState) => {
                // Custom merge to ensure array exists
                const merged = { ...currentState, ...(persistedState as object) };
                if (!merged.customOperations) merged.customOperations = [];
                return merged;
            },
            onRehydrateStorage: () => (state) => {
                state?.processOfflineProgress();
            }
        }
    )
);
