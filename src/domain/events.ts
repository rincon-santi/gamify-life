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
        id: 'evt_stagnant_air',
        title: "Stagnant Air",
        description: "The room feels heavy. Dust motes dance in a sunbeam that struggles to reach the floor.",
        weight: 15,
        triggerConditions: {
            minThreat: { ENTROPY: 20 }
        },
        choices: [
            {
                id: 'c_open_window',
                label: "Open a window",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_fresh_air',
                        title: "Let in Fresh Air",
                        description: "Open windows, let the breeze in, breathe.",
                        type: 'QUEST',
                        cost: { ORDER: 5 },
                        rewards: {
                            threatReduction: { ENTROPY: 10, STAGNATION: 5 },
                            resources: { ORDER: 5 }
                        },
                        // Generic duration: 4 hours
                        duration: 1000 * 60 * 60 * 4,
                        penalty: {
                            threat: { ENTROPY: 5 }
                        }
                    }
                }
            },
            {
                id: 'c_ignore_air',
                label: "Ignore it",
                type: 'IGNORE',
                outcome: {
                    threatChange: { ENTROPY: 2.5 }
                }
            }
        ]
    },
    {
        id: 'evt_digital_noise',
        title: "Digital Noise",
        description: "A phantom vibration in your pocket. The screen calls to you, demanding attention.",
        weight: 15,
        triggerConditions: {
            minThreat: { ENTROPY: 20 }
        },
        choices: [
            {
                id: 'c_clear_mind',
                label: "Clear the mind",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_meditate_moment',
                        title: "Brief Meditation",
                        description: "Close your eyes for 5 minutes. Silence the noise.",
                        type: 'QUEST',
                        cost: { ORDER: 5 },
                        rewards: {
                            resources: { ORDER: 15 },
                            threatReduction: { ENTROPY: 10, STAGNATION: 5 }
                        },
                        duration: 1000 * 60 * 60 * 2,
                        penalty: {
                            threat: { ENTROPY: 10 }
                        }
                    }
                }
            },
            {
                id: 'c_check_phone',
                label: "Check notifications",
                type: 'REJECT',
                outcome: {
                    threatChange: { STAGNATION: 5, ENTROPY: 0 }
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
            minThreat: { ENTROPY: 10 } // Low threshold so it happens often, but mainly when messy
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
                        penalty: {
                            threat: { ENTROPY: 25 }
                        }
                    }
                }
            },
            {
                id: 'c_give_up_keys',
                label: "Stay home",
                type: 'REJECT',
                outcome: {
                    threatChange: { SOLITUDE: 2.5, STAGNATION: 2.5 }
                }
            }
        ]
    },
    {
        id: 'evt_mystery_cable',
        title: "The Mystery Cable",
        description: "You found a USB cable in a drawer. You have no idea what device it charges, but you're afraid to throw it away.",
        weight: 12,
        triggerConditions: {
            minThreat: { ENTROPY: 15 }
        },
        choices: [
            {
                id: 'c_organize_tech',
                label: "Organize the tech drawer",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_tech_sort',
                        title: "Cable Management",
                        description: "Test the cables. Label them. Throw out the e-waste.",
                        type: 'QUEST',
                        cost: { ORDER: 5 },
                        rewards: {
                            resources: { ORDER: 15 },
                            threatReduction: { ENTROPY: 10 }
                        },
                        duration: 1000 * 60 * 60 * 24,
                        penalty: {
                            threat: { ENTROPY: 5 }
                        }
                    }
                }
            },
            {
                id: 'c_keep_cable',
                label: "Put it back 'just in case'",
                type: 'IGNORE',
                outcome: {
                    threatChange: { ENTROPY: 2 }
                }
            }
        ]
    },
    {
        id: 'evt_fridge_shadow',
        title: "The Fridge Archeology",
        description: "There is a tupperware container in the back of the fridge. The contents are no longer recognizable as food.",
        weight: 15,
        triggerConditions: {
            minThreat: { ENTROPY: 20 }
        },
        choices: [
            {
                id: 'c_purge_fridge',
                label: "Purge the fridge",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_fridge_clean',
                        title: "Fridge Purge",
                        description: "Brave the smell. Throw it out. Wash the shelves.",
                        type: 'QUEST',
                        cost: { ORDER: 10 },
                        rewards: {
                            resources: { ORDER: 10 },
                            threatReduction: { ENTROPY: 15 }
                        },
                        duration: 1000 * 60 * 60 * 2,
                        penalty: {
                            threat: { ENTROPY: 10 }
                        }
                    }
                }
            },
            {
                id: 'c_close_door',
                label: "Close the door gently",
                type: 'REJECT',
                outcome: {
                    threatChange: { ENTROPY: 5 }
                }
            }
        ]
    },
    {
        id: 'evt_chair_wardrobe',
        title: "The Chair Wardrobe",
        description: "That one chair in the corner is no longer visible. It has been consumed by a pile of 'not quite dirty, not quite clean' clothes.",
        weight: 18,
        triggerConditions: {
            minThreat: { ENTROPY: 15 }
        },
        choices: [
            {
                id: 'c_fold_laundry',
                label: "Reclaim the chair",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_laundry_mountain',
                        title: "Conquer the Laundry",
                        description: "Fold, hang, or wash. Just clear the chair.",
                        type: 'QUEST',
                        cost: { ORDER: 8 },
                        rewards: {
                            resources: { ORDER: 15 },
                            threatReduction: { ENTROPY: 10 }
                        },
                        duration: 1000 * 60 * 60 * 24,
                        penalty: {
                            threat: { ENTROPY: 5 }
                        }
                    }
                }
            },
            {
                id: 'c_add_shirt',
                label: "Add another shirt",
                type: 'IGNORE',
                outcome: {
                    threatChange: { ENTROPY: 2.5 }
                }
            }
        ]
    },

    {
        id: 'evt_paperwork_pile',
        title: "The Unopened Ledger",
        description: "Receipts, tax forms, and unread mail. The pile on the desk has grown taller than the lamp.",
        weight: 15,
        triggerConditions: {
            minThreat: { ENTROPY: 25 }
        },
        choices: [
            {
                id: 'c_do_taxes',
                label: "Sort the finances",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_financial_audit',
                        title: "Financial Audit",
                        description: "Categorize expenses, pay bills, file the documents.",
                        type: 'QUEST',
                        cost: { ORDER: 10 },
                        rewards: {
                            resources: { INFLUENCE: 5, ORDER: 5 }, // Lowered gains
                            threatReduction: { ENTROPY: 30 } // Increased reduction
                        },
                        // 6 hours
                        duration: 1000 * 60 * 60 * 6,
                        penalty: {
                            threat: { ENTROPY: 10 }
                        }
                    }
                }
            },
            {
                id: 'c_add_receipt',
                label: "Put a book on top",
                type: 'IGNORE',
                outcome: {
                    threatChange: { ENTROPY: 2.5 }
                }
            }
        ]
    },

    // --- STAGNATION EVENTS (Boredom, Lack of Growth, Procrastination) ---
    {
        id: 'evt_wiki_hole',
        title: "The Wikipedia Rabbit Hole",
        description: "You looked up 'cheese' 3 hours ago. You are now reading about the Defenestration of Prague. How did you get here?",
        weight: 15,
        triggerConditions: {
            minThreat: { STAGNATION: 15 }
        },
        choices: [
            {
                id: 'c_snap_out',
                label: "Snap out of it",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_focus_sprint',
                        title: "Focus Sprint",
                        description: "Close all 47 tabs. do one productive thing for 15 mins.",
                        type: 'QUEST',
                        cost: { ORDER: 5 },
                        rewards: {
                            resources: { ORDER: 10, INFLUENCE: 5 },
                            threatReduction: { STAGNATION: 10 }
                        },
                        duration: 1000 * 60 * 60 * 1,
                        penalty: {
                            threat: { STAGNATION: 5 }
                        }
                    }
                }
            },
            {
                id: 'c_one_more_link',
                label: "Click one more link",
                type: 'IGNORE',
                outcome: {
                    threatChange: { STAGNATION: 2.5 }
                }
            }
        ]
    },
    {
        id: 'evt_creative_itch',
        title: "The Creative Itch",
        description: "A sudden desire to make something. Anything. Your hands feel restless.",
        weight: 20,
        triggerConditions: {
            minThreat: { STAGNATION: 20 }
        },
        choices: [
            {
                id: 'c_sketch_write',
                label: "Create something small",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_quick_creation',
                        title: "Quick Creation",
                        description: "Doodle, write a paragraph, hum a tune.",
                        type: 'QUEST',
                        cost: { ORDER: 5 },
                        rewards: {
                            resources: { INFLUENCE: 10 },
                            threatReduction: { STAGNATION: 15 }
                        },
                        duration: 1000 * 60 * 60 * 6,
                        penalty: {
                            threat: { STAGNATION: 10 }
                        }
                    }
                }
            },
            {
                id: 'c_consume_media',
                label: "Watch something instead",
                type: 'IGNORE',
                outcome: {
                    threatChange: { STAGNATION: 5 }
                }
            }
        ]
    },
    {
        id: 'evt_foggy_mind',
        title: "The Fog",
        description: "Thoughts are moving through sludge. You've been sitting too long.",
        weight: 15,
        triggerConditions: {
            minThreat: { STAGNATION: 30 }
        },
        choices: [
            {
                id: 'c_stretch',
                label: "Stand up and stretch",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_stretch_break',
                        title: "Stretch Break",
                        description: "Get the blood flowing. 5 minutes.",
                        type: 'QUEST',
                        cost: { ORDER: 5 },
                        rewards: {
                            resources: { ORDER: 10 },
                            threatReduction: { STAGNATION: 10 }
                        },
                        duration: 1000 * 60 * 60 * 2,
                        penalty: {
                            threat: { STAGNATION: 10 }
                        }
                    }
                }
            },
            {
                id: 'c_sit_still',
                label: "Stay seated",
                type: 'REJECT',
                outcome: {
                    threatChange: { STAGNATION: 5 }
                }
            }
        ]
    },

    {
        id: 'evt_time_loop',
        title: "The Loop",
        description: "Monday feels like Tuesday. Tuesday feels like last week. The days are blurring into a single grey smear.",
        weight: 15,
        triggerConditions: {
            minThreat: { STAGNATION: 25 }
        },
        choices: [
            {
                id: 'c_break_pattern',
                label: "Break the pattern",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_new_experience',
                        title: "Novelty Injection",
                        description: "Go somewhere new. Eat something different. Break the script.",
                        type: 'QUEST',
                        cost: { ORDER: 5 },
                        rewards: {
                            resources: { INFLUENCE: 10, CONNECTION: 5 },
                            threatReduction: { STAGNATION: 20 }
                        },
                        duration: 1000 * 60 * 60 * 12,
                        penalty: {
                            threat: { STAGNATION: 10 }
                        }
                    }
                }
            },
            {
                id: 'c_let_it_blur',
                label: "Let it blur",
                type: 'IGNORE',
                outcome: {
                    threatChange: { STAGNATION: 5 }
                }
            }
        ]
    },

    // --- SOLITUDE EVENTS (Isolation, Loneliness) ---
    {
        id: 'evt_sudden_silence',
        title: "Sudden Silence",
        description: "The background noise stops. The quiet is sudden and sharp.",
        weight: 15,
        triggerConditions: {
            minThreat: { SOLITUDE: 25 }
        },
        choices: [
            {
                id: 'c_send_text',
                label: "Reach out to someone",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_check_in',
                        title: "Send a Message",
                        description: "Just a 'thinking of you' generic text.",
                        type: 'QUEST',
                        cost: { INFLUENCE: 5 },
                        rewards: {
                            resources: { CONNECTION: 10 },
                            threatReduction: { SOLITUDE: 10 }
                        },
                        duration: 1000 * 60 * 60 * 4,
                        penalty: {
                            threat: { SOLITUDE: 10 }
                        }
                    }
                }
            },
            {
                id: 'c_dwell',
                label: "Dwell in it",
                type: 'REJECT',
                outcome: {
                    threatChange: { SOLITUDE: 5 }
                }
            }
        ]
    },
    {
        id: 'evt_echo_chamber',
        title: "The Echo Chamber",
        description: "You haven't heard a human voice in hours. Only your own thoughts bouncing around.",
        weight: 12,
        triggerConditions: {
            minThreat: { SOLITUDE: 40 }
        },
        choices: [
            {
                id: 'c_human_voice',
                label: "Listen to something",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_podcast_call',
                        title: "Hear a Voice",
                        description: "Call someone or listen to a conversational podcast.",
                        type: 'QUEST',
                        cost: { INFLUENCE: 5 },
                        rewards: {
                            resources: { CONNECTION: 15 },
                            threatReduction: { SOLITUDE: 15 }
                        },
                        duration: 1000 * 60 * 60 * 6,
                        penalty: {
                            threat: { SOLITUDE: 15 }
                        }
                    }
                }
            },
            {
                id: 'c_stay_quiet',
                label: "Stay in the quiet",
                type: 'REJECT',
                outcome: {
                    threatChange: { SOLITUDE: 7.5 }
                }
            }
        ]
    },
    {
        id: 'evt_phantom_vibration',
        title: "The Phantom Vibration",
        description: "You checked your phone. No one messaged. The silence is digital now, too.",
        weight: 15,
        triggerConditions: {
            minThreat: { SOLITUDE: 15 }
        },
        choices: [
            {
                id: 'c_initiate',
                label: "Initiate contact",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_send_first',
                        title: "Send First",
                        description: "Don't wait for them. Send the meme. Say hello.",
                        type: 'QUEST',
                        cost: { INFLUENCE: 5 },
                        rewards: {
                            resources: { CONNECTION: 15 },
                            threatReduction: { SOLITUDE: 10 }
                        },
                        duration: 1000 * 60 * 60 * 4,
                        penalty: {
                            threat: { SOLITUDE: 5 }
                        }
                    }
                }
            },
            {
                id: 'c_put_away',
                label: "Put it away",
                type: 'REJECT',
                outcome: {
                    threatChange: { SOLITUDE: 5 }
                }
            }
        ]
    },
    {
        id: 'evt_crowded_room',
        title: "The Empty Chair",
        description: "You're doing something you enjoy, but you suddenly notice the empty space where someone else could be.",
        weight: 12,
        triggerConditions: {
            minThreat: { SOLITUDE: 30 }
        },
        choices: [
            {
                id: 'c_invite',
                label: "Invite someone",
                type: 'ACCEPT',
                outcome: {
                    grantOperation: {
                        id: 'op_host_hangout',
                        title: "Host",
                        description: "Invite someone over. Or meet them out.",
                        type: 'QUEST',
                        cost: { INFLUENCE: 10 },
                        rewards: {
                            resources: { CONNECTION: 25 },
                            threatReduction: { SOLITUDE: 20 }
                        },
                        duration: 1000 * 60 * 60 * 48,
                        penalty: {
                            threat: { SOLITUDE: 10 }
                        }
                    }
                }
            },
            {
                id: 'c_enjoy_solitude',
                label: "Enjoy the space",
                type: 'IGNORE',
                outcome: {
                    threatChange: { SOLITUDE: 5 }
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
                        },
                        penalty: {
                            threat: { SOLITUDE: 25 }
                        }
                    }
                }
            }
        ]
    }
];

export const ALL_EVENTS = [...GENERIC_EVENTS, ...COMEBACK_EVENTS];
