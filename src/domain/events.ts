import type { ResourceType } from "./resources";
import type { ThreatType } from "./threats";
import type { Operation } from "./logic";

export type EventChoiceType = 'ACCEPT' | 'REJECT' | 'IGNORE';

export interface EventOutcome {
    // If ACCEPT:
    grantOperation?: Operation; // The quest to add
    // If REJECT/IGNORE (or even ACCEPT penalty/cost):
    resourceChange?: Partial<Record<ResourceType, number>>;
    threatChange?: Partial<Record<ThreatType, number>>;
}

export interface EventChoice {
    id: string;
    label: string;
    description?: string; // Tooltip/Subtext
    type: EventChoiceType;
    outcome: EventOutcome;
}

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    choices: EventChoice[];

    // Conditions for this event to be theoretically possible
    triggerConditions?: {
        minThreat?: Partial<Record<ThreatType, number>>;
        maxThreat?: Partial<Record<ThreatType, number>>;
        minResource?: Partial<Record<ResourceType, number>>;
    };

    // Weight for RNG (higher = more likely)
    weight: number;

    // If true, this is a "Good" event (Comeback mechanic)
    isReliefEvent?: boolean;
}

// --- Specific Events Database ---

const GENERIC_EVENTS: GameEvent[] = [
    // --- ENTROPY EVENTS (Chaos, Decay, Broken Things) ---
    {
        id: 'evt_leaky_faucet',
        title: "The Leaky Faucet",
        description: "Drip. Drip. Drip. It's a minor annoyance now, but it threatens to rot the cabinet underneath.",
        weight: 15,
        choices: [
            {
                id: 'c_fix_plumbing',
                label: "Fix the plumbing",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_fix_plumbing',
                        title: "Fix Plumbing",
                        description: "Stop the dripping before it causes water damage.",
                        type: 'QUEST',
                        cost: { ORDER: 5 }, // "Energy" mapped to Order logic roughly, or just raw effort
                        rewards: {
                            threatReduction: { ENTROPY: 10 },
                            resources: { ORDER: 5 }
                        },
                        duration: 1000 * 60 * 60 * 24, // 1 day
                    }
                }
            },
            {
                id: 'c_ignore_leak',
                label: "Put a bucket under it",
                type: 'IGNORE',
                outcome: {
                    threatChange: { ENTROPY: 5 }
                }
            }
        ]
    },
    {
        id: 'evt_unopened_bill',
        title: "The Unopened Bill",
        description: "That envelope has been sitting on your desk for days. You know what's inside, but opening it feels like defeat.",
        weight: 12,
        choices: [
            {
                id: 'c_sort_finances',
                label: "Face it",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_sort_finances',
                        title: "Sort Finances",
                        description: "Open the bills, check accounts, organize paperwork.",
                        type: 'QUEST',
                        cost: { ORDER: 5 },
                        rewards: {
                            resources: { ORDER: 20 },
                            threatReduction: { ENTROPY: 15, STAGNATION: 5 }
                        },
                        duration: 1000 * 60 * 60 * 48,
                    }
                }
            },
            {
                id: 'c_ignore_bill',
                label: "Maybe tomorrow",
                type: 'REJECT',
                outcome: {
                    threatChange: { STAGNATION: 10, ENTROPY: 5 }
                }
            }
        ]
    },
    {
        id: 'evt_lost_keys',
        title: "The Lost Keys",
        description: "You're ready to leave, but your keys are gone. The clutter has claimed them.",
        weight: 15,
        triggerConditions: {
            minThreat: { ENTROPY: 30 } // Only happens if things are getting messy
        },
        choices: [
            {
                id: 'c_deep_clean',
                label: "Tear the house apart",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_deep_clean',
                        title: "Deep Clean",
                        description: "Find the keys and organize the mess while you're at it.",
                        type: 'QUEST',
                        cost: { ORDER: 15 },
                        rewards: {
                            resources: { ORDER: 20 },
                            threatReduction: { ENTROPY: 20 }
                        },
                        duration: 1000 * 60 * 60 * 4,
                    }
                }
            },
            {
                id: 'c_give_up_keys',
                label: "Stay home",
                type: 'REJECT',
                outcome: {
                    threatChange: { SOLITUDE: 5, STAGNATION: 5 }
                }
            }
        ]
    },

    // --- STAGNATION EVENTS (Boredom, Lack of Growth, Procrastination) ---
    {
        id: 'evt_doomscrolling',
        title: "The Doomscrolling Spiral",
        description: "You sat down for a minute, but two hours have passed. Your brain feels foggy.",
        weight: 20,
        choices: [
            {
                id: 'c_digital_detox',
                label: "Digital Detox Evening",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_digital_detox',
                        title: "Digital Detox",
                        description: "Put the phone away and do something analog.",
                        type: 'QUEST',
                        cost: { CONNECTION: 5 }, // Missing out on chats
                        rewards: {
                            resources: { INFLUENCE: 10, ORDER: 5 },
                            threatReduction: { STAGNATION: 15 }
                        },
                        duration: 1000 * 60 * 60 * 6,
                    }
                }
            },
            {
                id: 'c_keep_scrolling',
                label: "Just one more video",
                type: 'IGNORE',
                outcome: {
                    threatChange: { STAGNATION: 10, ENTROPY: 5 }
                }
            }
        ]
    },
    {
        id: 'evt_forgotten_goal',
        title: "The Forgotten Goal",
        description: "You remember that thing you wanted to learn. The books are still unread, the plan still unmade.",
        weight: 10,
        triggerConditions: {
            minThreat: { STAGNATION: 20 }
        },
        choices: [
            {
                id: 'c_start_learning',
                label: "Start small",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_learning_session',
                        title: "30-Minute Learning Session",
                        description: "Pick up that book, watch that tutorial, or practice that skill.",
                        type: 'QUEST',
                        cost: { ORDER: 5 },
                        rewards: {
                            resources: { INFLUENCE: 15 },
                            threatReduction: { STAGNATION: 10 }
                        },
                        duration: 1000 * 60 * 60 * 24,
                    }
                }
            },
            {
                id: 'c_no_time',
                label: "I don't have time",
                type: 'IGNORE',
                outcome: {
                    threatChange: { STAGNATION: 10 }
                }
            }
        ]
    },
    {
        id: 'evt_mirror_moment',
        title: "The Mirror Moment",
        description: "Your body has been sending signals - poor sleep, low energy, aches you ignore. It's time to listen.",
        weight: 8,
        choices: [
            {
                id: 'c_prioritize_health',
                label: "Prioritize health",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_movement_session',
                        title: "Movement Session",
                        description: "Go for a walk, stretch, exercise - anything to get moving.",
                        type: 'QUEST',
                        cost: { ORDER: 10 },
                        rewards: {
                            resources: { ORDER: 25 },
                            threatReduction: { ENTROPY: 20 }
                        },
                        duration: 1000 * 60 * 60 * 24,
                    }
                }
            },
            {
                id: 'c_start_monday',
                label: "I'll start Monday",
                type: 'REJECT',
                outcome: {
                    threatChange: { ENTROPY: 15 }
                }
            }
        ]
    },

    // --- SOLITUDE EVENTS (Isolation, Loneliness) ---
    {
        id: 'evt_ghosted_message',
        title: "The Unanswered Message",
        description: "You realize you never replied to that friend who reached out last week.",
        weight: 15,
        choices: [
            {
                id: 'c_reply_late',
                label: "Better late than never",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_catch_up',
                        title: "Catch-up Call",
                        description: "Apologize and reconnect.",
                        type: 'QUEST',
                        cost: { INFLUENCE: 5 },
                        rewards: {
                            resources: { CONNECTION: 15 },
                            threatReduction: { SOLITUDE: 10 }
                        },
                        duration: 1000 * 60 * 60 * 12,
                    }
                }
            },
            {
                id: 'c_too_awkward',
                label: "It's too awkward now",
                type: 'REJECT',
                outcome: {
                    threatChange: { SOLITUDE: 10 }
                }
            }
        ]
    },
    {
        id: 'evt_empty_weekend',
        title: "The Empty Weekend",
        description: "Friday night arrives. You have zero plans and the silence is loud.",
        weight: 12,
        triggerConditions: {
            minThreat: { SOLITUDE: 40 }
        },
        choices: [
            {
                id: 'c_find_event',
                label: "Go to a local meetup",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_meetup',
                        title: "Attend Meetup",
                        description: "Force yourself to go out and meet people.",
                        type: 'QUEST',
                        cost: { INFLUENCE: 10 },
                        rewards: {
                            resources: { CONNECTION: 25 },
                            threatReduction: { SOLITUDE: 20 }
                        },
                        duration: 1000 * 60 * 60 * 24,
                    }
                }
            },
            {
                id: 'c_stay_in',
                label: "Stay in",
                type: 'REJECT',
                outcome: {
                    threatChange: { SOLITUDE: 15 }
                }
            }
        ]
    },
    {
        id: 'evt_messy_inbox',
        title: "The Messy Inbox",
        description: "347 unread emails. Digital clutter is real clutter, and it's drowning you.",
        weight: 15,
        choices: [
            {
                id: 'c_inbox_zero',
                label: "Unsubscribe spree",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_inbox_sprint',
                        title: "Inbox Zero Sprint",
                        description: "Unsubscribe from junk, archive old emails, achieve clarity.",
                        type: 'QUEST',
                        cost: { ORDER: 10 },
                        rewards: {
                            resources: { ORDER: 25 },
                            threatReduction: { ENTROPY: 15 }
                        },
                        duration: 1000 * 60 * 60 * 48,
                    }
                }
            },
            {
                id: 'c_mark_read',
                label: "Mark all as read",
                type: 'IGNORE',
                outcome: {
                    threatChange: { ENTROPY: 8 }
                }
            }
        ]
    },
    {
        id: 'evt_overdue_checkup',
        title: "The Overdue Checkup",
        description: "When was your last dentist appointment? Doctor visit? You've been putting it off.",
        weight: 10,
        triggerConditions: {
            minThreat: { ENTROPY: 25 }
        },
        choices: [
            {
                id: 'c_schedule_appointment',
                label: "Make the call",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_schedule_checkup',
                        title: "Schedule Appointments",
                        description: "Book that dentist, doctor, or any other checkup you've been avoiding.",
                        type: 'QUEST',
                        cost: { INFLUENCE: 5 },
                        rewards: {
                            resources: { ORDER: 15 },
                            threatReduction: { ENTROPY: 10 }
                        },
                        duration: 1000 * 60 * 60 * 72,
                    }
                }
            },
            {
                id: 'c_feel_fine',
                label: "I feel fine",
                type: 'REJECT',
                outcome: {
                    threatChange: { ENTROPY: 10 }
                }
            }
        ]
    },
    {
        id: 'evt_broken_sleep',
        title: "The Broken Sleep Schedule",
        description: "Midnight scrolling, 3am thoughts, groggy mornings. Your circadian rhythm is screaming.",
        weight: 12,
        triggerConditions: {
            minThreat: { STAGNATION: 30 }
        },
        choices: [
            {
                id: 'c_reset_sleep',
                label: "Reset routine",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_early_bedtime',
                        title: "Early Bedtime",
                        description: "No screens after 10pm. Read a book. Reset your sleep cycle.",
                        type: 'QUEST',
                        cost: { CONNECTION: 5 }, // Missing late-night social time
                        rewards: {
                            resources: { ORDER: 20 },
                            threatReduction: { STAGNATION: 15 }
                        },
                        duration: 1000 * 60 * 60 * 24,
                    }
                }
            },
            {
                id: 'c_sleep_weak',
                label: "Sleep is for the weak",
                type: 'REJECT',
                outcome: {
                    threatChange: { STAGNATION: 12, ENTROPY: 5 }
                }
            }
        ]
    },
    {
        id: 'evt_birthday_forgot',
        title: "The Birthday You Forgot",
        description: "Facebook reminded you. You should have remembered on your own.",
        weight: 10,
        choices: [
            {
                id: 'c_thoughtful_message',
                label: "Better late than never",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_birthday_message',
                        title: "Thoughtful Message",
                        description: "Send a genuine, personal birthday message.",
                        type: 'QUEST',
                        cost: { INFLUENCE: 5 },
                        rewards: {
                            resources: { CONNECTION: 20 },
                            threatReduction: { SOLITUDE: 10 }
                        },
                        duration: 1000 * 60 * 60 * 12,
                    }
                }
            },
            {
                id: 'c_wont_notice',
                label: "They won't notice",
                type: 'REJECT',
                outcome: {
                    threatChange: { SOLITUDE: 12 }
                }
            }
        ]
    },

    // --- OPPORTUNITY EVENTS (Bonus, Windfalls) ---
    {
        id: 'evt_investment_tip',
        title: "Market Opportunity",
        description: "You spot a trend before it hits the mainstream.",
        weight: 5, // Rare
        choices: [
            {
                id: 'c_invest',
                label: "Investigate",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_market_research',
                        title: "Market Research",
                        description: "Deep dive into the data to verify the trend.",
                        type: 'QUEST',
                        cost: { ORDER: 10 },
                        rewards: {
                            resources: { INFLUENCE: 50 },
                            threatReduction: { STAGNATION: 5 }
                        },
                        duration: 1000 * 60 * 60 * 48,
                    }
                }
            },
            {
                id: 'c_risk_averse',
                label: "Too risky",
                type: 'IGNORE',
                outcome: {
                    // No penalty, just missed opportunity
                }
            }
        ]
    },
    {
        id: 'evt_community_project',
        title: "Community Garden",
        description: "Neighbors are starting a community project and need hands.",
        weight: 8,
        choices: [
            {
                id: 'c_volunteer',
                label: "Volunteer",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_volunteer',
                        title: "Volunteer Work",
                        description: "Spend the afternoon helping out.",
                        type: 'QUEST',
                        cost: { ORDER: 10 }, // Physical effort
                        rewards: {
                            resources: { CONNECTION: 30, INFLUENCE: 10 },
                            threatReduction: { SOLITUDE: 15, ENTROPY: 5 }
                        },
                        duration: 1000 * 60 * 60 * 72,
                    }
                }
            },
            {
                id: 'c_busy',
                label: "I'm too busy",
                type: 'REJECT',
                outcome: {
                    threatChange: { SOLITUDE: 2 }
                }
            }
        ]
    }
];

const COMEBACK_EVENTS: GameEvent[] = [
    {
        id: 'evt_ray_of_hope',
        title: "A Ray of Hope",
        description: "In the darkest hour, a small opportunity for redemption appears.",
        weight: 50, // High weight but only if condition met
        isReliefEvent: true,
        triggerConditions: {
            minThreat: { SOLITUDE: 80 }
        },
        choices: [
            {
                id: 'c_reach_out',
                label: "Reach out",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_lifeline',
                        title: "Call a Friend",
                        description: "A simple connection to pull you back.",
                        type: 'QUEST',
                        cost: { INFLUENCE: 0 },
                        rewards: {
                            resources: { CONNECTION: 20 },
                            threatReduction: { SOLITUDE: 25 }
                        }
                    }
                }
            }
        ]
    }
];

export const ALL_EVENTS = [...GENERIC_EVENTS, ...COMEBACK_EVENTS];
