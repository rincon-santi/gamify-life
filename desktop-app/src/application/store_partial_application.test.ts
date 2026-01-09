import { describe, it, expect, beforeEach } from 'vitest';
import { useSocietyStore } from './store';
import { act } from 'react';
import type { Operation } from '../domain/logic';

describe('useSocietyStore - Partial Penalty Application', () => {
    beforeEach(() => {
        const { reset } = useSocietyStore.getState();
        act(() => {
            reset();
        });
    });

    describe('Threat Clamping', () => {
        it('should clamp threats at 100 when penalty exceeds limit', () => {
            const { createOperation, deleteOperation } = useSocietyStore.getState();

            // Set Entropy to 90
            act(() => {
                useSocietyStore.setState((state) => {
                    state.threats.ENTROPY = 90;
                });
            });

            // Create a quest with massive penalty
            const quest: Operation = {
                id: 'quest_overflow',
                title: 'Impossible Quest',
                description: 'Massive consequences',
                type: 'QUEST',
                penalty: { threat: { ENTROPY: 50 } }, // Would bring to 140, but should cap at 100
                createdAt: Date.now()
            };

            act(() => {
                createOperation(quest);
            });

            act(() => {
                deleteOperation('quest_overflow');
            });

            // Should cap at 100, not go to 140
            expect(useSocietyStore.getState().threats.ENTROPY).toBe(100);

            // Should log the unapplied amount
            const history = useSocietyStore.getState().history;
            const unappliedLog = history.find(h => h.text.includes("couldn't be fully applied"));
            expect(unappliedLog).toBeDefined();
            expect(unappliedLog?.text).toContain('ENTROPY');
        });

        it('should clamp threats at 0 when negative change exceeds current value', () => {
            const { resolveEvent } = useSocietyStore.getState();

            // Set an active event
            act(() => {
                useSocietyStore.setState((state) => {
                    state.threats.ENTROPY = 5;
                    state.activeEvent = {
                        id: 'test_event',
                        title: 'Test Event',
                        description: 'Test',
                        weight: 1,
                        choices: [
                            {
                                id: 'reduce',
                                label: 'Reduce',
                                type: 'ACCEPT',
                                outcome: {
                                    threatChange: { ENTROPY: -20 } // Would bring to -15, should cap at 0
                                }
                            }
                        ]
                    };
                });
            });

            act(() => {
                resolveEvent('reduce');
            });

            // Should cap at 0, not go negative
            expect(useSocietyStore.getState().threats.ENTROPY).toBe(0);
        });

        it('should apply partial threat penalty and log unapplied amount', () => {
            const { applyPenalty } = useSocietyStore.getState();

            // Set threat near max
            act(() => {
                useSocietyStore.setState((state) => {
                    state.threats.STAGNATION = 95;
                });
            });

            act(() => {
                applyPenalty({ threat: { STAGNATION: 20 } }, 'Test Context');
            });

            // Should cap at 100
            expect(useSocietyStore.getState().threats.STAGNATION).toBe(100);

            // Should log the unapplied 15 points
            const history = useSocietyStore.getState().history;
            const unappliedLog = history.find(h => h.text.includes("couldn't be fully applied"));
            expect(unappliedLog).toBeDefined();
            expect(unappliedLog?.text).toContain('Test Context');
            expect(unappliedLog?.text).toContain('STAGNATION');
        });
    });

    describe('Resource Penalties', () => {
        it('should clamp resource penalties at 0', () => {
            const { applyPenalty } = useSocietyStore.getState();

            // Set resource low
            act(() => {
                useSocietyStore.setState((state) => {
                    state.resources.INFLUENCE = 5;
                });
            });

            act(() => {
                applyPenalty({ resource: { INFLUENCE: 20 } }, 'Resource Test');
            });

            // Should cap at 0, not go negative
            expect(useSocietyStore.getState().resources.INFLUENCE).toBe(0);

            // Should log unapplied amount
            const history = useSocietyStore.getState().history;
            const unappliedLog = history.find(h => h.text.includes("couldn't be fully applied"));
            expect(unappliedLog).toBeDefined();
            expect(unappliedLog?.text).toContain('INFLUENCE');
        });

        it('should allow resources to go negative from event changes (not penalties)', () => {
            const { resolveEvent } = useSocietyStore.getState();

            // Set up event with negative resource change
            act(() => {
                useSocietyStore.setState((state) => {
                    state.resources.ORDER = 10;
                    state.activeEvent = {
                        id: 'debt_event',
                        title: 'Debt Event',
                        description: 'Test',
                        weight: 1,
                        choices: [
                            {
                                id: 'debt',
                                label: 'Take Debt',
                                type: 'ACCEPT',
                                outcome: {
                                    resourceChange: { ORDER: -30 } // Should allow negative
                                }
                            }
                        ]
                    };
                });
            });

            act(() => {
                resolveEvent('debt');
            });

            // Should go negative (10 - 30 = -20)
            expect(useSocietyStore.getState().resources.ORDER).toBe(-20);
        });
    });

    describe('Combined Penalties', () => {
        it('should handle both threat and resource penalties with partial application', () => {
            const { applyPenalty } = useSocietyStore.getState();

            // Set up near-limit values
            act(() => {
                useSocietyStore.setState((state) => {
                    state.threats.ENTROPY = 95;
                    state.resources.CONNECTION = 3;
                });
            });

            act(() => {
                applyPenalty(
                    {
                        threat: { ENTROPY: 20 }, // Can only apply 5
                        resource: { CONNECTION: 10 } // Can only apply 3
                    },
                    'Combined Test'
                );
            });

            expect(useSocietyStore.getState().threats.ENTROPY).toBe(100);
            expect(useSocietyStore.getState().resources.CONNECTION).toBe(0);

            // Should log both unapplied amounts
            const history = useSocietyStore.getState().history;
            const unappliedLog = history.find(h => h.text.includes("couldn't be fully applied"));
            expect(unappliedLog).toBeDefined();
            expect(unappliedLog?.text).toContain('ENTROPY');
            expect(unappliedLog?.text).toContain('CONNECTION');
        });
    });

    describe('No Unapplied Logging', () => {
        it('should NOT log when penalties are fully applied', () => {
            const { applyPenalty } = useSocietyStore.getState();

            const historyLengthBefore = useSocietyStore.getState().history.length;

            // Apply penalty that fits within limits
            act(() => {
                applyPenalty({ threat: { ENTROPY: 5 } }, 'Small Penalty');
            });

            const historyLengthAfter = useSocietyStore.getState().history.length;

            // Should not add any history entry
            expect(historyLengthAfter).toBe(historyLengthBefore);
        });
    });
});
