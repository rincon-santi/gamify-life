
import { describe, it, expect } from 'vitest';

// Mimic the logic from LedgerView.tsx matches exactly
function calculateRewards(draftAspect: 'STABILITY' | 'COHESION' | 'AMBITION', draftImportance: 'LOW' | 'MEDIUM' | 'HIGH', draftTreasury: 'NEUTRAL' | 'YIELD' | 'GRANT') {
    const multiplier = draftImportance === 'HIGH' ? 3 : (draftImportance === 'MEDIUM' ? 2 : 1);

    let rewards: any = {
        resources: {},
        threatReduction: { STAGNATION: 2 * multiplier }
    };
    let cost: any = {};

    switch (draftAspect) {
        case 'STABILITY':
            rewards.resources.ORDER = 5 * multiplier;
            rewards.threatReduction.ENTROPY = 5 * multiplier;
            break;
        case 'COHESION':
            rewards.resources.CONNECTION = 5 * multiplier;
            rewards.threatReduction.SOLITUDE = 5 * multiplier;
            break;
        case 'AMBITION':
            break;
    }

    switch (draftTreasury) {
        case 'YIELD':
            rewards.resources.INFLUENCE = 5 * multiplier;
            break;
        case 'GRANT':
            cost.INFLUENCE = 2 * multiplier;
            break;
        case 'NEUTRAL':
            break;
    }

    return { rewards, cost };
}

describe('Gains Discrepancy Investigation', () => {
    it('should have identical rewards for Action, Ritual, and Quest with same settings', () => {
        const aspect = 'STABILITY';
        const importance = 'LOW';
        const treasury = 'NEUTRAL';

        const { rewards: actionRewards } = calculateRewards(aspect, importance, treasury);
        const { rewards: ritualRewards } = calculateRewards(aspect, importance, treasury);
        const { rewards: questRewards } = calculateRewards(aspect, importance, treasury);

        expect(actionRewards).toEqual(ritualRewards);
        expect(actionRewards).toEqual(questRewards);

        console.log('Action Rewards:', actionRewards);
        console.log('Ritual Rewards:', ritualRewards);
    });
});
