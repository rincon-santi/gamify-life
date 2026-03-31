import type { ResourceType } from "./resources";
import type { ThreatType } from "./threats";

// --- Data Models ---

export type OperationType = 'RITUAL' | 'QUEST' | 'ACTION';

export interface Modifier {
    id: string;
    name: string;
    description: string;
    effect: {
        resource?: Partial<Record<ResourceType, number>>;
        threat?: Partial<Record<ThreatType, number>>;
    };
    duration?: number; // In seconds, if temporary
    createdAt: number;
}

export interface Operation {
    id: string;
    title: string;
    description: string;
    cost?: Partial<Record<ResourceType, number>>;
    rewards?: {
        resources?: Partial<Record<ResourceType, number>>;
        threatReduction?: Partial<Record<ThreatType, number>>;
    };
    grantedModifiers?: Modifier[];
    cooldown?: number; // In seconds
    recurrenceInterval?: number; // In milliseconds (e.g. 24h)
    lastCompleted?: number; // Timestamp
    penalty?: {
        threat?: Partial<Record<ThreatType, number>>;
        resource?: Partial<Record<ResourceType, number>>;
    };
    isCustom?: boolean;
    createdAt?: number; // Timestamp
    expiresAt?: number; // Timestamp
    duration?: number; // Duration in milliseconds
    type: OperationType;
}
