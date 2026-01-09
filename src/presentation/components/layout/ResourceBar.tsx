import { Gem, Scroll, Users } from "lucide-react";
import { useSocietyStore } from "../../../application/store";
import { RESOURCE_NAMES } from "../../../domain/resources";

export function ResourceBar() {
    const resources = useSocietyStore((s) => s.resources);

    return (
        <div className="h-16 border-b border-border bg-card flex items-center px-6 justify-between select-none">
            <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3 text-primary">
                    <Gem className="size-5" />
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            {RESOURCE_NAMES.INFLUENCE}
                        </span>
                        <span className="text-lg font-mono leading-none">
                            {resources.INFLUENCE.toFixed(1)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-3 text-blue-400">
                    <Scroll className="size-5" />
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            {RESOURCE_NAMES.ORDER}
                        </span>
                        <span className="text-lg font-mono leading-none">
                            {resources.ORDER.toFixed(1)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-3 text-green-400">
                    <Users className="size-5" />
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            {RESOURCE_NAMES.CONNECTION}
                        </span>
                        <span className="text-lg font-mono leading-none">
                            {resources.CONNECTION.toFixed(1)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="text-muted-foreground text-sm italic font-serif opacity-50">
                "The Covenant Endures"
            </div>
        </div>
    );
}
