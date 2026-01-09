export type ThreatType = 'ENTROPY' | 'STAGNATION' | 'SOLITUDE';

export const THREAT_NAMES: Record<ThreatType, string> = {
    ENTROPY: "Entropy",
    STAGNATION: "Stagnation",
    SOLITUDE: "Solitude",
};

export const THREAT_DESCRIPTIONS: Record<ThreatType, string> = {
    ENTROPY: "The chaos of the physical realm. Decays buildings and mind.",
    STAGNATION: "The rot of inaction. Increases when ambitions are ignored.",
    SOLITUDE: "The void of isolation. Increases when allies are neglected.",
};
