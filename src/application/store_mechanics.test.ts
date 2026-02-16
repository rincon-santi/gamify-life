import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSocietyStore } from './store';
import { act } from 'react';
import type { Operation } from '../domain/logic';

describe('useSocietyStore - Mechanics', () => {
    beforeEach(() => {
        const { reset } = useSocietyStore.getState();
        act(() => {
            reset();
        });
    });

    it('should apply penalty of deleted Quest', () => {
        const { createOperation, deleteOperation } = useSocietyStore.getState();

        // Setup a quest with penalty
        const quest: Operation = {
            id: 'quest_1',
            title: 'Hard Quest',
            description: 'Do it or suffer',
            type: 'QUEST',
            penalty: { threat: { ENTROPY: 20 } },
            createdAt: Date.now()
        };

        act(() => {
            createOperation(quest);
        });

        // Verify it was created
        expect(useSocietyStore.getState().customOperations).toHaveLength(1);

        // Delete it
        act(() => {
            deleteOperation('quest_1');
        });

        // Verify removed
        expect(useSocietyStore.getState().customOperations).toHaveLength(0);

        // Verify Penalty
        // Reset sets Entropy to 0. Initial + 20 = 20.
        expect(useSocietyStore.getState().threats.ENTROPY).toBe(20);

        // Verify History
        const history = useSocietyStore.getState().history;
        expect(history[history.length - 1].text).toContain("Abandoned QUEST");
    });

    it('should apply penalty of deleted Ritual', () => {
        const { createOperation, deleteOperation } = useSocietyStore.getState();

        const ritual: Operation = {
            id: 'ritual_1',
            title: 'Daily Ritual',
            description: 'Maintain order',
            type: 'RITUAL',
            penalty: { threat: { STAGNATION: 10 } }
        };

        act(() => {
            createOperation(ritual);
        });

        act(() => {
            deleteOperation('ritual_1');
        });

        expect(useSocietyStore.getState().threats.STAGNATION).toBe(10); // 0 + 10
        const history = useSocietyStore.getState().history;
        expect(history[history.length - 1].text).toContain("Abandoned RITUAL");
    });

    it('should NOT apply penalty for deleted Action', () => {
        const { createOperation, deleteOperation } = useSocietyStore.getState();

        const action: Operation = {
            id: 'action_1',
            title: 'Simple Task',
            description: 'Just a task',
            type: 'ACTION'
            // No penalty usually, but even if it had one, we only strictly enforce for quest/ritual
            // Wait, the logic is: if (QUEST || RITUAL) apply penalty.
            // So Actions should be safe even if they somehow had penalty data attached.
        };

        act(() => {
            createOperation(action);
        });

        act(() => {
            deleteOperation('action_1');
        });

        // Entropy should remain at initial 0
        expect(useSocietyStore.getState().threats.ENTROPY).toBe(0);

        // History shouldn't say Abandoned
        const history = useSocietyStore.getState().history;
        // Last should be "Established" from creation, unless delete logs something else?
        // Delete doesn't log for normal operations currently in my implementation.
        expect(history[history.length - 1].text).toContain("Established");
    });

    it('should prevent editing Quest/Ritual', () => {
        const { createOperation, editOperation } = useSocietyStore.getState();

        const quest: Operation = {
            id: 'quest_1',
            title: 'Original Title',
            description: 'Original Desc',
            type: 'QUEST'
        };

        act(() => {
            createOperation(quest);
        });

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        act(() => {
            editOperation('quest_1', { title: 'New Title' });
        });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Operation denied"));

        // Verify no change
        const op = useSocietyStore.getState().customOperations.find(o => o.id === 'quest_1');
        expect(op?.title).toBe('Original Title');

        consoleSpy.mockRestore();
    });

    it('should allow editing Action', () => {
        const { createOperation, editOperation } = useSocietyStore.getState();

        const action: Operation = {
            id: 'action_1',
            title: 'Original Action',
            description: 'Original Desc',
            type: 'ACTION'
        };

        act(() => {
            createOperation(action);
        });

        act(() => {
            editOperation('action_1', { title: 'New Action Title' });
        });

        // Verify change
        const op = useSocietyStore.getState().customOperations.find(o => o.id === 'action_1');
        expect(op?.title).toBe('New Action Title');
    });

    it('should NOT automatically delete expired Quest (defer to ReportModal)', () => {
        const { createOperation, tick } = useSocietyStore.getState();

        // 1. Create a Quest that expires quickly
        const quest: Operation = {
            id: 'quest_expired',
            title: 'Urgent Quest',
            description: 'Do it fast',
            type: 'QUEST',
            expiresAt: Date.now() - 1000, // Look, it already expired 1s ago!
            penalty: { threat: { ENTROPY: 50 } }, // Massive penalty
            createdAt: Date.now() - 5000
        };

        act(() => {
            createOperation(quest);
        });

        // 2. Tick
        act(() => {
            tick();
        });

        // 3. Verify it is STILL there
        expect(useSocietyStore.getState().customOperations).toHaveLength(1);
        const op = useSocietyStore.getState().customOperations[0];
        expect(op.id).toBe('quest_expired');

        // 4. Verify no penalty applied yet
        // Note: tick() applies a tiny amount of natural growth (e.g. 0.00004), so it won't be exactly 10.
        // But if penalty (50) was applied, it would be ~60. Use a threshold.
        expect(useSocietyStore.getState().threats.ENTROPY).toBeLessThan(15);
    });

    it('should NOT apply penalty when quest is completed and removed', () => {
        const { createOperation, executeOperation, removeOperation } = useSocietyStore.getState();

        // 1. Create a quest with a penalty
        const quest: Operation = {
            id: 'quest_complete',
            title: 'Completable Quest',
            description: 'Complete this quest',
            type: 'QUEST',
            penalty: { threat: { ENTROPY: 30 } },
            rewards: { resources: { INFLUENCE: 50 } },
            createdAt: Date.now()
        };

        act(() => {
            createOperation(quest);
        });

        // 2. Execute it (complete it)
        act(() => {
            executeOperation(quest);
        });

        // 3. Remove it using removeOperation
        act(() => {
            removeOperation('quest_complete');
        });

        // 4. Verify quest is removed
        expect(useSocietyStore.getState().customOperations).toHaveLength(0);

        // 5. Verify penalty was NOT applied (should still be 0 from reset)
        expect(useSocietyStore.getState().threats.ENTROPY).toBe(0);

        // 6. Verify rewards WERE applied
        expect(useSocietyStore.getState().resources.INFLUENCE).toBe(60); // 10 + 50

        // 7. Verify history shows "Executed" not "Abandoned"
        const history = useSocietyStore.getState().history;
        const executedEntry = history.find(h => h.text.includes('Executed'));
        expect(executedEntry).toBeDefined();
        const abandonedEntry = history.find(h => h.text.includes('Abandoned'));
        expect(abandonedEntry).toBeUndefined();
    });


});
