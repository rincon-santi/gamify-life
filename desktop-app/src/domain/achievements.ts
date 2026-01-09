import type { Difficulty } from '../application/store';

export type AchievementCategory = 'WEALTH' | 'SURVIVAL' | 'RISK' | 'RECOVERY' | 'EVENT' | 'SPECIAL';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    category: AchievementCategory;
    icon?: string; // Icon name from Lucide
    isHidden?: boolean; // If true, description is hidden until unlocked
    condition: (state: any, prevState?: any) => boolean;
}

// Ensure unique IDs
export const ACHIEVEMENTS: Achievement[] = [
    // --- RESOURCE TYCOON (WEALTH) ---
    // Influence
    {
        id: 'inf_100',
        title: 'Local Influencer',
        description: 'Amass 100 Influence points.',
        category: 'WEALTH',
        condition: (s) => s.resources['INFLUENCE'] >= 100
    },
    {
        id: 'inf_500',
        title: 'Minor Celebrity',
        description: 'Amass 500 Influence points.',
        category: 'WEALTH',
        condition: (s) => s.resources['INFLUENCE'] >= 500
    },
    {
        id: 'inf_1000',
        title: 'Cult Leader',
        description: 'Amass 1,000 Influence points.',
        category: 'WEALTH',
        condition: (s) => s.resources['INFLUENCE'] >= 1000
    },
    {
        id: 'inf_5000',
        title: 'Shadow Broker',
        description: 'Amass 5,000 Influence points.',
        category: 'WEALTH',
        condition: (s) => s.resources['INFLUENCE'] >= 5000
    },
    {
        id: 'inf_10000',
        title: 'Master of Puppets',
        description: 'Amass 10,000 Influence points.',
        category: 'WEALTH',
        condition: (s) => s.resources['INFLUENCE'] >= 10000
    },

    // Order
    {
        id: 'ord_100',
        title: 'Tidy Desk',
        description: 'Reach 100 Order.',
        category: 'WEALTH',
        condition: (s) => s.resources['ORDER'] >= 100
    },
    {
        id: 'ord_500',
        title: 'Feng Shui Expert',
        description: 'Reach 500 Order.',
        category: 'WEALTH',
        condition: (s) => s.resources['ORDER'] >= 500
    },
    {
        id: 'ord_1000',
        title: 'Zen Master',
        description: 'Reach 1,000 Order.',
        category: 'WEALTH',
        condition: (s) => s.resources['ORDER'] >= 1000
    },
    {
        id: 'ord_5000',
        title: 'Crystalline Mind',
        description: 'Reach 5,000 Order.',
        category: 'WEALTH',
        condition: (s) => s.resources['ORDER'] >= 5000
    },
    {
        id: 'ord_10000',
        title: 'Entropy\'s Bane',
        description: 'Reach 10,000 Order.',
        category: 'WEALTH',
        condition: (s) => s.resources['ORDER'] >= 10000
    },

    // Connection
    {
        id: 'con_100',
        title: 'Pen Pal',
        description: 'Reach 100 Connection.',
        category: 'WEALTH',
        condition: (s) => s.resources['CONNECTION'] >= 100
    },
    {
        id: 'con_500',
        title: 'Life of the Party',
        description: 'Reach 500 Connection.',
        category: 'WEALTH',
        condition: (s) => s.resources['CONNECTION'] >= 500
    },
    {
        id: 'con_1000',
        title: 'Social Butterfly',
        description: 'Reach 1,000 Connection.',
        category: 'WEALTH',
        condition: (s) => s.resources['CONNECTION'] >= 1000
    },
    {
        id: 'con_5000',
        title: 'Hive MindNode',
        description: 'Reach 5,000 Connection.',
        category: 'WEALTH',
        condition: (s) => s.resources['CONNECTION'] >= 5000
    },
    {
        id: 'con_10000',
        title: 'Universal Empath',
        description: 'Reach 10,000 Connection.',
        category: 'WEALTH',
        condition: (s) => s.resources['CONNECTION'] >= 10000
    },


    // --- SURVIVOR (TIME) ---
    // Note: Depends on accurate tick tracking. We'll use (now - createdAt) / 86400000 > days
    // Assuming we add `createdAt` to state or estimate via history length?
    // Store doesn't have `createdAt` yet. We might need to base this on total ticks or something?
    // Or just "Time since last game over" which implies current session length.
    // Let's assume we add `sessionStartTime` to store alongside `createdAt` (of save).
    // For now, let's use a placeholder condition: CHECK_DAYS_SURVIVED(state, days)

    // Easy
    {
        id: 'surv_e_7',
        title: 'Baby Steps',
        description: 'Survive 1 week.',
        category: 'SURVIVAL',
        condition: (s) => getDaysSurvived(s) >= 7
    },
    {
        id: 'surv_e_30',
        title: 'Monthly Subscriber',
        description: 'Survive 1 month.',
        category: 'SURVIVAL',
        condition: (s) => getDaysSurvived(s) >= 30
    },
    {
        id: 'surv_e_365',
        title: 'Another Trip Around the Sun',
        description: 'Survive 1 year.',
        category: 'SURVIVAL',
        condition: (s) => getDaysSurvived(s) >= 365
    },

    // Medium (Specific)
    {
        id: 'surv_m_7',
        title: 'Competent Living',
        description: 'Survive 1 week on Medium difficulty.',
        category: 'SURVIVAL',
        condition: (s) => getDaysSurvived(s) >= 7 && isDifficultyAtLeast(s, 'MEDIUM')
    },
    {
        id: 'surv_m_30',
        title: 'Stability is Key',
        description: 'Survive 1 month on Medium difficulty.',
        category: 'SURVIVAL',
        condition: (s) => getDaysSurvived(s) >= 30 && isDifficultyAtLeast(s, 'MEDIUM')
    },
    {
        id: 'surv_m_365',
        title: 'Functioning Adult',
        description: 'Survive 1 year on Medium difficulty.',
        category: 'SURVIVAL',
        condition: (s) => getDaysSurvived(s) >= 365 && isDifficultyAtLeast(s, 'MEDIUM')
    },

    // Hard (Scarce)
    {
        id: 'surv_h_7',
        title: 'Hardcore',
        description: 'Survive 1 week on Hard difficulty.',
        category: 'SURVIVAL',
        condition: (s) => getDaysSurvived(s) >= 7 && isDifficultyAtLeast(s, 'HARD')
    },
    {
        id: 'surv_h_30',
        title: 'Iron Will',
        description: 'Survive 1 month on Hard difficulty.',
        category: 'SURVIVAL',
        condition: (s) => getDaysSurvived(s) >= 30 && isDifficultyAtLeast(s, 'HARD')
    },
    {
        id: 'surv_h_365',
        title: 'Cockroach King',
        description: 'Survive 1 year on Hard difficulty. You are unkillable.',
        category: 'SURVIVAL',
        condition: (s) => getDaysSurvived(s) >= 365 && isDifficultyAtLeast(s, 'HARD')
    },

    // --- RISK (BRINKMANSHIP) ---
    // Requires tracking "time spent in danger zone". This is hard for simple state checks.
    // Simplifying: "Have >90 threat".
    {
        id: 'risk_ent_90',
        title: 'Living in Filth',
        description: 'Reach >90 Entropy.',
        category: 'RISK',
        condition: (s) => s.threats['ENTROPY'] > 90
    },
    {
        id: 'risk_stag_90',
        title: 'Couch Potato',
        description: 'Reach >90 Stagnation.',
        category: 'RISK',
        condition: (s) => s.threats['STAGNATION'] > 90
    },
    {
        id: 'risk_sol_90',
        title: 'Lone Wolf',
        description: 'Reach >90 Solitude.',
        category: 'RISK',
        condition: (s) => s.threats['SOLITUDE'] > 90
    },
    {
        id: 'risk_all_80',
        title: 'On the Edge',
        description: 'Have ALL threats above 80 simultaneously.',
        category: 'RISK',
        condition: (s) =>
            s.threats['ENTROPY'] > 80 &&
            s.threats['STAGNATION'] > 80 &&
            s.threats['SOLITUDE'] > 80
    },

    // --- RECOVERY ---
    // Needs previous state
    {
        id: 'rec_ent',
        title: 'The Great Cleanup',
        description: 'Reduce Entropy from >90 to <10 in one session.',
        category: 'RECOVERY',
        condition: (s, p) => p && p.threats['ENTROPY'] > 90 && s.threats['ENTROPY'] < 10
    },
    {
        id: 'rec_stag',
        title: 'Get Up And Go',
        description: 'Reduce Stagnation from >90 to <10 in one session.',
        category: 'RECOVERY',
        condition: (s, p) => p && p.threats['STAGNATION'] > 90 && s.threats['STAGNATION'] < 10
    },
    {
        id: 'rec_sol',
        title: 'Reconnected',
        description: 'Reduce Solitude from >90 to <10 in one session.',
        category: 'RECOVERY',
        condition: (s, p) => p && p.threats['SOLITUDE'] > 90 && s.threats['SOLITUDE'] < 10
    },

    // --- PERFECTIONIST ---
    {
        id: 'perf_0',
        title: 'Tabula Rasa',
        description: 'Have ALL threats at exactly 0.',
        category: 'SPECIAL',
        condition: (s) =>
            s.threats['ENTROPY'] === 0 &&
            s.threats['STAGNATION'] === 0 &&
            s.threats['SOLITUDE'] === 0
    },

    // --- EVENT ---
    // Requires tracking event count in history or separate counter
    // For now: check history length? Inaccurate but works for v1.
    {
        id: 'evt_10',
        title: 'Participant',
        description: 'Experience 10 Events.',
        category: 'EVENT',
        condition: (s) => s.history.filter((h: any) => h.type === 'EVENT').length >= 10
    },
    {
        id: 'evt_50',
        title: 'Veteran',
        description: 'Experience 50 Events.',
        category: 'EVENT',
        condition: (s) => s.history.filter((h: any) => h.type === 'EVENT').length >= 50
    },
    {
        id: 'evt_100',
        title: 'Oracle',
        description: 'Experience 100 Events.',
        category: 'EVENT',
        condition: (s) => s.history.filter((h: any) => h.type === 'EVENT').length >= 100
    },
];

// Helpers
function getDaysSurvived(state: any): number {
    // We need to add sessionStartTime to store
    // For now, let's use a brave assumption or check if the state has it.
    // If not, we fall back to 0.
    if (!state.sessionStartTime) return 0;
    const diff = Date.now() - state.sessionStartTime;
    return diff / (1000 * 60 * 60 * 24);
}

function isDifficultyAtLeast(state: any, diff: Difficulty): boolean {
    const levels = ['EASY', 'MEDIUM', 'HARD'];
    const currentIdx = levels.indexOf(state.difficulty);
    const targetIdx = levels.indexOf(diff);
    return currentIdx >= targetIdx;
}
