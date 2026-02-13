
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSocietyStore } from './store';

// Mock storage
vi.mock('./storage', () => ({
    createStorage: () => ({
        getItem: vi.fn(() => Promise.resolve(null)),
        setItem: vi.fn(() => Promise.resolve()),
        removeItem: vi.fn(() => Promise.resolve()),
    }),
}));

describe('Game Mechanics Refinement', () => {
    beforeEach(() => {
        useSocietyStore.getState().reset();
        useSocietyStore.setState({
            threats: { ENTROPY: 0, STAGNATION: 0, SOLITUDE: 0 },
            resources: { INFLUENCE: 100, ORDER: 100, CONNECTION: 100 },
            activeEvent: null,
            customOperations: [] // Clear quests
        });
    });

    it('should remove a QUEST from the list when it is successfully executed', () => {
        const questId = 'op_test_quest';
        useSocietyStore.setState({
            customOperations: [{
                id: questId,
                title: 'Test Quest',
                description: 'Do the thing',
                type: 'QUEST',
                cost: { ORDER: 10 },
                rewards: { resources: { INFLUENCE: 10 } },
                createdAt: Date.now(),
                expiresAt: Date.now() + 100000
            }]
        });

        expect(useSocietyStore.getState().customOperations).toHaveLength(1);
        useSocietyStore.getState().executeOperation(useSocietyStore.getState().customOperations[0]);
        expect(useSocietyStore.getState().customOperations).toHaveLength(0);
    });

    it('should NOT remove an ACTION task (Normal) from the list when executed', () => {
        const customId = 'op_test_custom';
        useSocietyStore.setState({
            customOperations: [{
                id: customId,
                title: 'Normal Task',
                description: 'Reusable',
                type: 'ACTION',
                cost: { ORDER: 10 },
                rewards: { resources: { INFLUENCE: 10 } },
                createdAt: Date.now()
            }]
        });

        expect(useSocietyStore.getState().customOperations).toHaveLength(1);
        useSocietyStore.getState().executeOperation(useSocietyStore.getState().customOperations[0]);
        // Should STILL be there
        expect(useSocietyStore.getState().customOperations).toHaveLength(1);
        expect(useSocietyStore.getState().customOperations[0].id).toBe(customId);
    });

    it('should NOT remove a RITUAL from the list when executed', () => {
        const ritualId = 'op_test_ritual';
        useSocietyStore.setState({
            customOperations: [{
                id: ritualId,
                title: 'Daily Ritual',
                description: 'Repeat me',
                type: 'RITUAL',
                cost: { ORDER: 10 },
                rewards: { resources: { INFLUENCE: 10 } },
                createdAt: Date.now()
            }]
        });

        expect(useSocietyStore.getState().customOperations).toHaveLength(1);
        useSocietyStore.getState().executeOperation(useSocietyStore.getState().customOperations[0]);
        // Should STILL be there
        expect(useSocietyStore.getState().customOperations).toHaveLength(1);
        expect(useSocietyStore.getState().customOperations[0].id).toBe(ritualId);
    });
});
