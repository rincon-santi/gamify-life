
import { AnimatePresence, motion } from "framer-motion";
import { useSocietyStore } from "../../../application/store";
import { ArrowRight, X, Sparkles } from "lucide-react";
import { useEffect } from "react";

// --- Tutorial Data ---
interface TutorialStep {
    title: string;
    content: string;
    position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'top-center';
    highlightId?: string;
    action?: (store: any) => void;
}

// ... (skipping to getPositionClasses)


export const STEPS: TutorialStep[] = [
    {
        title: "Welcome, Initiate",
        content: "You have entered the Covenant. Your goal is simple: Create Order from Chaos. Maintain your Resources to survive against the encroaching threats.",
        position: 'center'
    },
    {
        title: "The Sanctuary",
        content: "This map represents your inner world. As threats grow, the Sanctuary will darken and decay. Keep the lights on.",
        position: 'center', // Ideally pointing to map
        highlightId: 'map-view'
    },
    {
        title: "Resources & Threats",
        content: "Observe the sidebar on the left. Your Resources (Influence, Order, Connection) are your lifeblood. The Threats (Entropy, Stagnation, Solitude) are your enemies. If any Threat reaches 100%, the lineage ends.",
        position: 'top-right', // Adjusted to not cover sidebar
        highlightId: 'resources-threats'
    },
    {
        title: "The Ledger",
        content: "Navigate to 'The Ledger' tab. Here you define your Protocols. Create Rituals for daily maintenance, Quests for big gains, or Actions for quick fixes.",
        position: 'bottom-left',
        highlightId: 'nav-ledger'
    },
    {
        title: "Drafting Protocols",
        content: "Click 'Draft Decree' to create a new task. Select its Type (Action, Ritual, Quest) to determine its mechanics and rewards. Hover over options to learn more.",
        position: 'center',
        highlightId: 'draft-btn'
    },
    {
        title: "Integrity",
        content: "The Ledger is a mirror, not a generator. Only check off tasks you have truly completed in the physical world. To deceive the Ledger is to sever your connection to reality.",
        position: 'center'
    },
    {
        title: "Events",
        content: "Random events will test your resolve. Your choices matter. Accept challenges to gain rewards, or ignore them at your peril.",
        position: 'top-center',
        action: ({ triggerMockEvent }) => {
            // Mock Event
            triggerMockEvent({
                id: 'tutorial-event',
                title: 'A Test of Faith',
                description: 'The shadows whisper doubts. Do you hold fast to your convictions?',
                choices: [
                    {
                        id: 'c1',
                        label: 'Stand Firm',
                        outcome: {
                            resourceChange: { ORDER: 5 },
                            grantOperation: {
                                id: 'tut_quest',
                                title: 'Prove Your Worth',
                                description: 'The darkness recedes, but you must solidify your stance. Complete this quest.',
                                type: 'QUEST',
                                expiresAt: Date.now() + 1000 * 60 * 30, // 30 mins
                                rewards: { resources: { INFLUENCE: 10 } }
                            }
                        }
                    },
                    { id: 'c2', label: 'Listen', outcome: { threatChange: { ENTROPY: 5 } } }
                ]
            });
        }
    },
    {
        title: "Begin",
        content: "The clock is ticking. Good luck.",
        position: 'center'
    }
];

export function TutorialOverlay() {
    const isTutorialActive = useSocietyStore((s) => s.isTutorialActive);
    const tutorialStep = useSocietyStore((s) => s.tutorialStep);
    const nextTutorialStep = useSocietyStore((s) => s.nextTutorialStep);
    const endTutorial = useSocietyStore((s) => s.endTutorial);

    const triggerMockEvent = useSocietyStore((s) => s.triggerMockEvent);

    // Derive directly from store state to avoid sync issues
    const currentStepData = STEPS[tutorialStep];

    useEffect(() => {
        if (currentStepData) {
            // Execute action if present
            if (currentStepData.action) {
                // Pass the safe trigger function
                currentStepData.action({ triggerMockEvent });
            }
        } else if (isTutorialActive && tutorialStep >= STEPS.length) {
            // End if went past last step
            endTutorial();
        }
    }, [tutorialStep, currentStepData, isTutorialActive, endTutorial, triggerMockEvent]);

    // if (!isTutorialActive || !currentStepData) return null; // Logic moved to render for AnimatePresence

    const getPositionClasses = (pos: string) => {
        switch (pos) {
            case 'top-left': return "top-20 left-72";
            case 'top-right': return "top-20 right-20";
            case 'bottom-left': return "bottom-20 left-72";
            case 'bottom-right': return "bottom-20 right-20";
            case 'bottom-center': return "bottom-20 left-1/2 -translate-x-1/2";
            case 'top-center': return "top-20 left-1/2 -translate-x-1/2";
            default: return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
        }
    };

    return (
        <>
            {/* Backdrop Layer - z-[100] - Below Highlighted Elements (z-[101]) */}
            <AnimatePresence>
                {isTutorialActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/80 pointer-events-auto"
                    />
                )}
            </AnimatePresence>

            {/* content Layer - z-[200] - Above Highlighted Elements */}
            <AnimatePresence mode="wait">
                {isTutorialActive && currentStepData && (
                    <motion.div
                        key={tutorialStep}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`fixed pointer-events-auto max-w-md z-[3000] ${getPositionClasses(currentStepData.position || 'center')}`}
                    >
                        <div className="bg-card border border-primary/50 text-card-foreground p-6 rounded-lg shadow-[0_0_30px_rgba(var(--primary),0.3)] relative overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                                    <Sparkles className="size-6 text-primary animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif text-primary tracking-wide mb-1">
                                        {currentStepData.title}
                                    </h3>
                                    <div className="h-0.5 w-12 bg-primary/30" />
                                </div>
                                <button
                                    onClick={endTutorial}
                                    className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            <p className="text-muted-foreground leading-relaxed mb-6 font-serif">
                                {currentStepData.content}
                            </p>

                            <div className="flex justify-between items-center">
                                <div className="flex gap-1">
                                    {STEPS.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${idx === tutorialStep ? 'bg-primary w-4' : 'bg-primary/20'}`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={nextTutorialStep}
                                    className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary px-4 py-2 rounded transition-all group"
                                >
                                    <span className="uppercase text-xs font-bold tracking-widest">
                                        {tutorialStep === STEPS.length - 1 ? 'Begin' : 'Next'}
                                    </span>
                                    <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
