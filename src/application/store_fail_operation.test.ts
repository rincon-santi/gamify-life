import { describe, it, expect, beforeEach } from 'vitest';
import { useSocietyStore } from './store';
import { act } from 'react';
import type { Operation } from '../domain/logic';

describe('useSocietyStore - failOperation', () => {
    beforeEach(() => {
        const { reset } = useSocietyStore.getState();
        act(() => {
            reset();
        });
    });

    it('should apply penalties and remove QUEST operation upon failure', () => {
        const { createOperation, failOperation } = useSocietyStore.getState();

        const quest: Operation = {
            id: 'quest-1',
            type: 'QUEST',
            title: 'Test Quest',
            description: 'A test quest',
            cost: {},
            rewards: {},
            penalty: {
                threat: { ENTROPY: 10 },
                resource: { INFLUENCE: 5 }
            },
            time: 100,
            expiresAt: Date.now() + 10000
        };

        // Initialize state
        act(() => {
            createOperation(quest);
            // Give some resources to penalize
            useSocietyStore.getState().addResource('INFLUENCE', 20);
        });

        // Verify initial state
        expect(useSocietyStore.getState().customOperations).toHaveLength(1);
        const initialResources = useSocietyStore.getState().resources;
        const initialThreats = useSocietyStore.getState().threats;

        // Fail the operation
        act(() => {
            failOperation(quest);
        });

        const state = useSocietyStore.getState();

        // Check penalties applied
        expect(state.threats.ENTROPY).toBe(initialThreats.ENTROPY + 10);
        expect(state.resources.INFLUENCE).toBe(initialResources.INFLUENCE - 5);

        // Check operation removed
        expect(state.customOperations).toHaveLength(0);

        // Check history updated
        expect(state.history[state.history.length - 1].text).toContain('Failed Quest: Test Quest');
    });

    it('should apply penalties and reset timer for RITUAL operation upon failure', () => {
        const { createOperation, failOperation } = useSocietyStore.getState();

        const ritual: Operation = {
            id: 'ritual-1',
            type: 'RITUAL',
            title: 'Test Ritual',
            description: 'A test ritual',
            cost: {},
            rewards: {},
            penalty: {
                threat: { STAGNATION: 10 }
            },
            time: 100,
            recurrenceInterval: 1000,
            createdAt: Date.now() - 2000 // Created a while ago
        };

        // Initialize state
        act(() => {
            createOperation(ritual);
        });

        const initialThreats = useSocietyStore.getState().threats;

        // Fail the operation
        const beforeFail = Date.now();
        act(() => {
            failOperation(ritual);
        });
        const afterFail = Date.now();

        const state = useSocietyStore.getState();

        // Check penalties applied
        expect(state.threats.STAGNATION).toBe(initialThreats.STAGNATION + 10);

        // Check operation NOT removed
        expect(state.customOperations).toHaveLength(1);

        // Check lastCompleted updated
        const updatedOp = state.customOperations[0];
        expect(updatedOp.lastCompleted).toBeGreaterThanOrEqual(beforeFail);
        expect(updatedOp.lastCompleted).toBeLessThanOrEqual(afterFail);

        // Check history updated
        expect(state.history[state.history.length - 1].text).toContain('Failed Ritual: Test Ritual');
    });
});
