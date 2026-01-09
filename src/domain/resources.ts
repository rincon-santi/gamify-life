export type ResourceType = 'INFLUENCE' | 'ORDER' | 'CONNECTION';

export const RESOURCE_NAMES: Record<ResourceType, string> = {
    INFLUENCE: "Influence",
    ORDER: "Order",
    CONNECTION: "Connection",
};

export const RESOURCE_DESCRIPTIONS: Record<ResourceType, string> = {
    INFLUENCE: "Political capital and wealth. Used to acquire assets.",
    ORDER: "Stability and clarity. Combats Entropy.",
    CONNECTION: "Social bonds and allies. Combats Solitude.",
};
