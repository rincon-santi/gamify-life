
import { describe, it, expect, beforeEach } from 'vitest';
import { useSocietyStore } from '../application/store';
import type { Operation } from '../domain/logic';

describe('useSocietyStore - failOperation', () => {
    beforeEach(() => {
        useSocietyStore.getState().reset();
    });

    it('should apply threat penalty when an operation fails', () => {
        const op: Operation = {
            id: 'test-op',
            title: 'Test Operation',
            description: 'A test operation',
            type: 'QUEST',
            penalty: {
                threat: { ENTROPY: 10 }
            }
        };

        const initialEntropy = useSocietyStore.getState().threats.ENTROPY;
        useSocietyStore.getState().failOperation(op);
        const finalEntropy = useSocietyStore.getState().threats.ENTROPY;

        expect(finalEntropy).toBe(initialEntropy + 10);
    });

    it('should apply resource penalty when an operation fails', () => {
        const op: Operation = {
            id: 'test-op-res',
            title: 'Test Operation Resource',
            description: 'A test operation',
            type: 'QUEST',
            penalty: {
                resource: { ORDER: 5 }
            }
        };

        const initialOrder = useSocietyStore.getState().resources.ORDER;
        useSocietyStore.getState().failOperation(op);
        const finalOrder = useSocietyStore.getState().resources.ORDER;

        expect(finalOrder).toBe(initialOrder - 5);
    });

    it('should remove a QUEST from customOperations when it fails', () => {
        const op: Operation = {
            id: 'quest-1',
            title: 'Quest 1',
            description: 'A quest',
            type: 'QUEST',
            createdAt: Date.now()
        };

        // We need to bypass createOperation's history logging if we want to check history accurately,
        // but it's fine.
        useSocietyStore.getState().createOperation(op);

        const opsBefore = useSocietyStore.getState().customOperations;
        expect(opsBefore.some(o => o.id === 'quest-1')).toBe(true);

        useSocietyStore.getState().failOperation(op);

        const opsAfter = useSocietyStore.getState().customOperations;
        expect(opsAfter.some(o => o.id === 'quest-1')).toBe(false);
    });

    it('should update lastCompleted for a RITUAL when it fails', () => {
        const op: Operation = {
            id: 'ritual-1',
            title: 'Ritual 1',
            description: 'A ritual',
            type: 'RITUAL',
            createdAt: Date.now() - 10000,
            recurrenceInterval: 5000
        };

        useSocietyStore.getState().createOperation(op);

        const beforeFail = Date.now();
        useSocietyStore.getState().failOperation(op);
        const afterFail = Date.now();

        const updatedOp = useSocietyStore.getState().customOperations.find(o => o.id === 'ritual-1');
        expect(updatedOp).toBeDefined();
        expect(updatedOp?.lastCompleted).toBeGreaterThanOrEqual(beforeFail);
        expect(updatedOp?.lastCompleted).toBeLessThanOrEqual(afterFail);
    });

    it('should update lastCompleted for an ACTION if it exists in customOperations', () => {
        const op: Operation = {
            id: 'action-1',
            title: 'Action 1',
            description: 'An action',
            type: 'ACTION'
        };

        useSocietyStore.getState().createOperation(op);

        const beforeFail = Date.now();
        useSocietyStore.getState().failOperation(op);
        const afterFail = Date.now();

        const updatedOp = useSocietyStore.getState().customOperations.find(o => o.id === 'action-1');
        expect(updatedOp?.lastCompleted).toBeGreaterThanOrEqual(beforeFail);
        expect(updatedOp?.lastCompleted).toBeLessThanOrEqual(afterFail);
    });

    it('should log failure to history', () => {
        const op: Operation = {
            id: 'test-op',
            title: 'Test Op',
            description: 'desc',
            type: 'ACTION'
        };

        useSocietyStore.getState().failOperation(op);
        const history = useSocietyStore.getState().history;
        const lastEntry = history[history.length - 1];
        expect(lastEntry.text).toBe('Failed ACTION: Test Op');
    });
});
