import { describe, it, expect, beforeEach } from 'vitest';
import { useSocietyStore } from './store';
import { act } from 'react';

describe('useSocietyStore - hasStarted', () => {
    beforeEach(() => {
        const { reset } = useSocietyStore.getState();
        act(() => {
            reset();
        });
    });

    it('should return false for initial state', () => {
        const { hasStarted } = useSocietyStore.getState();
        expect(hasStarted()).toBe(false);
    });

    it('should return true if resources change', () => {
        const { addResource, hasStarted } = useSocietyStore.getState();

        act(() => {
            addResource('INFLUENCE', 5);
        });

        expect(useSocietyStore.getState().resources.INFLUENCE).toBe(15);
        expect(hasStarted()).toBe(true);
    });

    it('should return true if threats change', () => {
        const { addThreat, hasStarted } = useSocietyStore.getState();

        act(() => {
            addThreat('ENTROPY', 5);
        });

        expect(useSocietyStore.getState().threats.ENTROPY).toBe(15);
        expect(hasStarted()).toBe(true);
    });

    it('should return true if history has more than 1 entry', () => {
        const { createOperation, hasStarted } = useSocietyStore.getState();

        // Creating an operation adds a history entry
        act(() => {
            createOperation({
                id: 'test',
                title: 'Test Op',
                type: 'ACTION',
                cost: {},
                rewards: {},
                createdAt: Date.now(),
                description: 'test'
            });
        });

        expect(useSocietyStore.getState().history.length).toBeGreaterThan(1);
        expect(hasStarted()).toBe(true);
    });
});
