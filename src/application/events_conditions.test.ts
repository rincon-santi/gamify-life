
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSocietyStore } from './store';

// Mock storage BEFORE importing store to ensure it uses the mock
vi.mock('./storage', () => ({
    createStorage: () => ({
        getItem: vi.fn(() => Promise.resolve(null)),
        setItem: vi.fn(() => Promise.resolve()),
        removeItem: vi.fn(() => Promise.resolve()),
    }),
}));

describe('Event System Condition Logic', () => {
    beforeEach(() => {
        useSocietyStore.getState().reset();
        useSocietyStore.setState({
            threats: { ENTROPY: 0, STAGNATION: 0, SOLITUDE: 0 },
            resources: { INFLUENCE: 10, ORDER: 10, CONNECTION: 10 },
            activeEvent: null,
            history: []
        });
    });

    it('should trigger Lost Keys (restored event) mostly when Entropy is present', () => {
        // Lost Keys has minEntropy: 10
        useSocietyStore.setState({
            threats: { ENTROPY: 20, STAGNATION: 0, SOLITUDE: 0 }
        });

        // Sophisticated mock for Math.random to handle both trigger check and selection
        let callCount = 0;
        const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
            callCount++;
            if (callCount % 2 === 1) {
                return 0.0001; // First call: Trigger CHECK ( < 0.003 ) -> PASS
            } else {
                return (callCount * 0.13) % 1; // Second call: SELECTION -> Pseudo-Random Sweep
            }
        });

        let found = false;
        // Search for Lost Keys event
        for (let i = 0; i < 3000; i++) {
            useSocietyStore.setState({ activeEvent: null });
            useSocietyStore.getState().tick();
            if (useSocietyStore.getState().activeEvent?.id === 'evt_lost_keys') {
                found = true;
                break;
            }
        }
        expect(found).toBe(true);
        randomSpy.mockRestore();
    });

    it('should trigger a new generic event: Wikipedia Rabbit Hole', () => {
        // Stagnation: 15 required
        useSocietyStore.setState({
            threats: { ENTROPY: 0, STAGNATION: 20, SOLITUDE: 0 }
        });

        let callCount = 0;
        const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
            callCount++;
            if (callCount % 2 === 1) return 0.0001; // Pass trigger
            return (callCount * 0.17) % 1; // Different sweep
        });

        let found = false;
        for (let i = 0; i < 3000; i++) {
            useSocietyStore.setState({ activeEvent: null });
            useSocietyStore.getState().tick();
            // Check for the wiki hole event
            if (useSocietyStore.getState().activeEvent?.id === 'evt_wiki_hole') {
                found = true;
                break;
            }
        }
        expect(found).toBe(true);
        randomSpy.mockRestore();
    });
});
