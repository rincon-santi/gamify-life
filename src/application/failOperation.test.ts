import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSocietyStore } from './store';
import { act } from 'react';

describe('useSocietyStore - failOperation', () => {
    beforeEach(() => {
        const { reset } = useSocietyStore.getState();
        act(() => {
            reset();
        });
    });

    it('should handle failing a QUEST and remove it', () => {
        const { createOperation, failOperation } = useSocietyStore.getState();

        const quest = {
            id: 'quest-1',
            title: 'Test Quest',
            description: 'Test Description',
            type: 'QUEST' as const,
            penalty: {
                threat: { ENTROPY: 10 }
            }
        };

        act(() => {
            createOperation(quest);
        });

        expect(useSocietyStore.getState().customOperations).toHaveLength(1);
        expect(useSocietyStore.getState().threats.ENTROPY).toBe(0);

        act(() => {
            failOperation('quest-1');
        });

        expect(useSocietyStore.getState().customOperations).toHaveLength(0);
        expect(useSocietyStore.getState().threats.ENTROPY).toBe(10);
        expect(useSocietyStore.getState().history.some(h => h.text.includes('Failed QUEST: Test Quest'))).toBe(true);
    });

    it('should handle failing a RITUAL and reset its timer', () => {
        const { createOperation, failOperation } = useSocietyStore.getState();

        const ritual = {
            id: 'ritual-1',
            title: 'Test Ritual',
            description: 'Test Description',
            type: 'RITUAL' as const,
            recurrenceInterval: 1000,
            penalty: {
                resource: { INFLUENCE: 5 }
            }
        };

        act(() => {
            createOperation(ritual);
        });

        expect(useSocietyStore.getState().customOperations).toHaveLength(1);
        const initialResources = useSocietyStore.getState().resources.INFLUENCE;

        const now = Date.now();
        vi.useFakeTimers();
        vi.setSystemTime(now);

        act(() => {
            failOperation('ritual-1');
        });

        const state = useSocietyStore.getState();
        expect(state.customOperations).toHaveLength(1);
        expect(state.resources.INFLUENCE).toBe(initialResources - 5);
        expect(state.customOperations[0].lastCompleted).toBe(now);
        expect(state.history.some(h => h.text.includes('Failed RITUAL: Test Ritual'))).toBe(true);

        vi.useRealTimers();
    });

    it('should handle penalties correctly when they are partially unapplied', () => {
        const { createOperation, failOperation, addThreat } = useSocietyStore.getState();

        // Push threat close to max
        act(() => {
            addThreat('ENTROPY', 95);
        });

        const quest = {
            id: 'quest-unapplied',
            title: 'Unapplied Penalty Quest',
            description: 'Test Description',
            type: 'QUEST' as const,
            penalty: {
                threat: { ENTROPY: 10 }
            }
        };

        act(() => {
            createOperation(quest);
        });

        act(() => {
            failOperation('quest-unapplied');
        });

        const state = useSocietyStore.getState();
        expect(state.threats.ENTROPY).toBe(100); // Clamped at 100
        expect(state.history.some(h => h.text.includes("Some penalties couldn't be fully applied"))).toBe(true);
    });
});
