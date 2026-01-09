import { describe, it, expect } from 'vitest';
import { ALL_EVENTS } from './events';
import { THREAT_NAMES } from './threats';
import { RESOURCE_NAMES } from './resources';

describe('Narrative Events', () => {
    it('should have a list of events', () => {
        expect(ALL_EVENTS.length).toBeGreaterThan(0);
    });

    it('all events should have unique IDs', () => {
        const ids = ALL_EVENTS.map(e => e.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it('all events should have valid choices', () => {
        ALL_EVENTS.forEach(event => {
            expect(event.choices.length).toBeGreaterThan(0);
            event.choices.forEach(choice => {
                expect(choice.id).toBeDefined();
                expect(choice.label).toBeDefined();
                expect(['ACCEPT', 'REJECT', 'IGNORE']).toContain(choice.type);
            });
        });
    });

    it('all outcomes should refer to valid resources/threats if present', () => {
        ALL_EVENTS.forEach(event => {
            event.choices.forEach(choice => {
                const { outcome } = choice;
                if (outcome.resourceChange) {
                    Object.keys(outcome.resourceChange).forEach(key => {
                        expect(Object.keys(RESOURCE_NAMES)).toContain(key);
                    });
                }
                if (outcome.threatChange) {
                    Object.keys(outcome.threatChange).forEach(key => {
                        expect(Object.keys(THREAT_NAMES)).toContain(key);
                    });
                }
                if (outcome.grantOperation) {
                    // Check if grantOperation has valid rewards
                    if (outcome.grantOperation.rewards) {
                        if (outcome.grantOperation.rewards.resources) {
                            Object.keys(outcome.grantOperation.rewards.resources).forEach(key => {
                                expect(Object.keys(RESOURCE_NAMES)).toContain(key);
                            });
                        }
                        if (outcome.grantOperation.rewards.threatReduction) {
                            Object.keys(outcome.grantOperation.rewards.threatReduction).forEach(key => {
                                expect(Object.keys(THREAT_NAMES)).toContain(key);
                            });
                        }
                    }
                }
            });
        });
    });
});
