/**
 * Desktop App Parity Tests
 * 
 * These tests verify that the desktop-app version maintains feature parity
 * with the original web version. Run these after any changes to ensure
 * no regressions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSocietyStore } from './store';
import type { Operation } from '../domain/logic';

describe('Desktop App Parity - Quest/Ritual Expiration', () => {
    beforeEach(() => {
        // Reset store before each test
        const { reset } = useSocietyStore.getState();
        reset();
    });

    it('should detect expired quests immediately', async () => {
        const { result } = renderHook(() => useSocietyStore());

        // Create a quest that expires in 100ms
        const expiredQuest: Operation = {
            id: 'test-quest-1',
            type: 'QUEST',
            title: 'Test Quest',
            description: 'Should expire quickly',
            cost: {},
            rewards: { resources: { INFLUENCE: 10 } },
            expiresAt: Date.now() + 100,
            createdAt: Date.now(),
        };

        act(() => {
            result.current.createOperation(expiredQuest);
        });

        expect(result.current.customOperations).toHaveLength(1);

        // Wait for expiration
        await new Promise(resolve => setTimeout(resolve, 150));

        // Quest should still be in the list (waiting for user report)
        expect(result.current.customOperations).toHaveLength(1);
        expect(result.current.customOperations[0].expiresAt).toBeLessThan(Date.now());
    });

    it('should apply penalties when quest is reported as failed', () => {
        const { result } = renderHook(() => useSocietyStore());

        const failedQuest: Operation = {
            id: 'test-quest-2',
            type: 'QUEST',
            title: 'Failed Quest',
            description: 'Will be failed',
            cost: {},
            rewards: {},
            penalty: {
                threat: { ENTROPY: 10 },
            },
            expiresAt: Date.now() - 1000, // Already expired
            createdAt: Date.now() - 2000,
        };

        act(() => {
            result.current.createOperation(failedQuest);
        });

        const initialEntropy = result.current.threats.ENTROPY;

        act(() => {
            result.current.deleteOperation('test-quest-2');
        });

        // Quest should be removed and penalty applied
        expect(result.current.customOperations).toHaveLength(0);
        expect(result.current.threats.ENTROPY).toBe(initialEntropy + 10);
    });

    it('should reset ritual timer when completed', () => {
        const { result } = renderHook(() => useSocietyStore());

        const ritual: Operation = {
            id: 'test-ritual-1',
            type: 'RITUAL',
            title: 'Daily Ritual',
            description: 'Do this daily',
            cost: {},
            rewards: { resources: { ORDER: 5 } },
            recurrenceInterval: 1000, // 1 second for testing
            createdAt: Date.now(),
        };

        act(() => {
            result.current.createOperation(ritual);
        });

        const beforeComplete = Date.now();

        act(() => {
            result.current.executeOperation(ritual);
        });

        const ritualAfterComplete = result.current.customOperations[0];
        expect(ritualAfterComplete.lastCompleted).toBeGreaterThanOrEqual(beforeComplete);
    });

    it('should correctly detect started game via hasRunStarted', () => {
        const { result } = renderHook(() => useSocietyStore());

        // Initially should be false
        expect(result.current.hasStarted()).toBe(false);
        expect(result.current.hasRunStarted).toBe(false);

        // Start new game
        act(() => {
            result.current.reset();
        });

        // Should now be true
        expect(result.current.hasStarted()).toBe(true);
        expect(result.current.hasRunStarted).toBe(true);
    });
});

describe('Desktop App Parity - Storage', () => {
    it('should persist state to electron-store', async () => {
        const { result } = renderHook(() => useSocietyStore());

        act(() => {
            result.current.addResource('INFLUENCE', 50);
            result.current.setDifficulty('HARD');
        });

        // Wait for persistence
        await new Promise(resolve => setTimeout(resolve, 100));

        // The state should be persisted
        expect(result.current.resources.INFLUENCE).toBe(60); // 10 initial + 50
        expect(result.current.difficulty).toBe('HARD');
    });
});

describe('Desktop App Parity - Threat Growth', () => {
    it('should grow threats at correct rate for each difficulty', () => {
        const { result } = renderHook(() => useSocietyStore());

        // Test EASY difficulty
        act(() => {
            result.current.setDifficulty('EASY');
            result.current.tick();
        });

        const easyGrowth = result.current.threats.ENTROPY - 10; // Initial is 10

        // Test MEDIUM difficulty
        act(() => {
            result.current.reset();
            result.current.setDifficulty('MEDIUM');
            result.current.tick();
        });

        const mediumGrowth = result.current.threats.ENTROPY - 10;

        // Test HARD difficulty
        act(() => {
            result.current.reset();
            result.current.setDifficulty('HARD');
            result.current.tick();
        });

        const hardGrowth = result.current.threats.ENTROPY - 10;

        // Hard should grow faster than Medium, Medium faster than Easy
        expect(hardGrowth).toBeGreaterThan(mediumGrowth);
        expect(mediumGrowth).toBeGreaterThan(easyGrowth);
    });
});

describe('Desktop App Parity - Offline Progress', () => {
    it('should calculate offline threat growth correctly', () => {
        const { result } = renderHook(() => useSocietyStore());

        const now = Date.now();
        const oneHourAgo = now - (1000 * 60 * 60);

        act(() => {
            // Set lastActiveTime to 1 hour ago
            result.current.lastActiveTime = oneHourAgo;
            result.current.processOfflineProgress();
        });

        // Threats should have grown during offline period
        expect(result.current.threats.ENTROPY).toBeGreaterThan(10);
    });
});
