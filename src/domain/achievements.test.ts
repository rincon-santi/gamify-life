import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS } from './achievements';

// Mock State Helper
const createState = (overrides: any = {}) => ({
    resources: {
        INFLUENCE: 0,
        ORDER: 0,
        CONNECTION: 0,
        ...overrides.resources
    },
    threats: {
        ENTROPY: 0,
        STAGNATION: 0,
        SOLITUDE: 0,
        ...overrides.threats
    },
    history: [],
    achievements: [],
    difficulty: 'MEDIUM',
    sessionStartTime: Date.now(),
    ...overrides
});

describe('Achievements Domain Logic', () => {
    it('should unlock resource achievements', () => {
        const ach = ACHIEVEMENTS.find(a => a.id === 'inf_100')!;
        expect(ach).toBeDefined();

        const stateLow = createState({ resources: { INFLUENCE: 99 } });
        expect(ach.condition(stateLow)).toBe(false);

        const stateHigh = createState({ resources: { INFLUENCE: 100 } });
        expect(ach.condition(stateHigh)).toBe(true);
    });

    it('should unlock survival achievements based on difficulty', () => {
        const survHard = ACHIEVEMENTS.find(a => a.id === 'surv_h_7')!;

        // Mock survival time to 8 days
        const mockTime = Date.now() - (1000 * 60 * 60 * 24 * 8);

        const stateEasy = createState({
            sessionStartTime: mockTime,
            difficulty: 'EASY'
        });
        expect(survHard.condition(stateEasy)).toBe(false);

        const stateHard = createState({
            sessionStartTime: mockTime,
            difficulty: 'HARD'
        });
        expect(survHard.condition(stateHard)).toBe(true);
    });

    it('should unlock risk achievements', () => {
        const riskEnt = ACHIEVEMENTS.find(a => a.id === 'risk_ent_90')!;

        const stateSafe = createState({ threats: { ENTROPY: 89 } });
        expect(riskEnt.condition(stateSafe)).toBe(false);

        const stateDanger = createState({ threats: { ENTROPY: 91 } });
        expect(riskEnt.condition(stateDanger)).toBe(true);
    });

    it('should unlock recovery achievements', () => {
        const recEnt = ACHIEVEMENTS.find(a => a.id === 'rec_ent')!;

        const current = createState({ threats: { ENTROPY: 5 } });
        const prev = createState({ threats: { ENTROPY: 95 } });

        expect(recEnt.condition(current, prev)).toBe(true);
        expect(recEnt.condition(current, createState({ threats: { ENTROPY: 50 } }))).toBe(false);
    });
});
