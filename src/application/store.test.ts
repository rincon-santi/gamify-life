import { describe, it, expect, beforeEach } from 'vitest';
import { useSocietyStore } from '../application/store';
import type { Operation } from '../domain/logic';

// Helper to reset store
const resetStore = () => {
    useSocietyStore.setState({
        resources: { INFLUENCE: 10, ORDER: 50, CONNECTION: 50 },
        threats: { ENTROPY: 10, STAGNATION: 0, SOLITUDE: 0 },
        modifiers: [],
        history: [],
    });
};

describe('SocietyStore Game Engine', () => {
    beforeEach(() => {
        resetStore();
    });

    it('should initialize with default values', () => {
        const state = useSocietyStore.getState();
        expect(state.resources.INFLUENCE).toBe(10);
        expect(state.resources.ORDER).toBe(50);
        expect(state.threats.ENTROPY).toBe(10);
    });

    it('should add resources correctly', () => {
        const { addResource } = useSocietyStore.getState();
        addResource('INFLUENCE', 5);
        expect(useSocietyStore.getState().resources.INFLUENCE).toBe(15);
    });

    it('should execute operation: deduct cost and grant reward', () => {
        const { executeOperation } = useSocietyStore.getState();
        const op: Operation = {
            id: '1',
            title: 'Test',
            description: 'Test',
            type: 'ACTION',
            cost: { INFLUENCE: 5 },
            rewards: { resources: { ORDER: 2 } }
        };

        executeOperation(op);

        const state = useSocietyStore.getState();
        expect(state.resources.INFLUENCE).toBe(5); // 10 - 5
        expect(state.resources.ORDER).toBe(52); // 50 + 2
        expect(state.history).toContain('Executed: Test');
    });

    it('should prevent execution if costs are too high', () => {
        const { executeOperation } = useSocietyStore.getState();
        const op: Operation = {
            id: '1',
            title: 'Test',
            description: 'desc',
            type: 'ACTION',
            cost: { INFLUENCE: 20 }, // Too expensive
            rewards: { resources: { ORDER: 100 } }
        };

        executeOperation(op);

        const state = useSocietyStore.getState();
        expect(state.resources.INFLUENCE).toBe(10); // Unchanged
        expect(state.resources.ORDER).toBe(50); // Unchanged
    });

    it('should reduce threats on execution', () => {
        const { executeOperation } = useSocietyStore.getState();
        const op: Operation = {
            id: '2',
            title: 'Threat Reduce',
            description: 'Test',
            type: 'ACTION',
            rewards: { threatReduction: { ENTROPY: 5 } }
        };

        executeOperation(op);
        expect(useSocietyStore.getState().threats.ENTROPY).toBe(5); // 10 - 5
    });
});
