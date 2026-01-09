export type HistoryType = 'EVENT' | 'ACHIEVEMENT' | 'TASK' | 'THREAT' | 'FLAVOR';

export interface HistoryEntry {
    id: string; // Unique ID (uuid or timestamp+random)
    timestamp: number;
    text: string;
    type: HistoryType;
    details?: {
        eventId?: string;
        achievementId?: string;
        threatType?: string;
        // Any other metadata needed for specialized rendering
    };
}
