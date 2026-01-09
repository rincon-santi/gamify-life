import React from "react";
import { Map, BookOpen, Scroll } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../../shared/utils";

// Minimal Tooltip Setup (Simple wrapper as actual Radix Tooltip adds complexity without styles setup)
const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

interface NavigationProps {
    activeView: 'MAP' | 'LEDGER' | 'ARCHIVES';
    onViewChange: (view: 'MAP' | 'LEDGER' | 'ARCHIVES') => void;
}

export function Navigation({ activeView, onViewChange }: NavigationProps) {
    return (
        <TooltipProvider>
            <div className="flex flex-col items-stretch gap-2 py-4 w-full px-2">
                <NavButton
                    view="MAP"
                    icon={Map}
                    label="The Map Room"
                    current={activeView}
                    onClick={() => onViewChange('MAP')}
                />
                <NavButton
                    view="LEDGER"
                    icon={BookOpen}
                    label="The Ledger"
                    current={activeView}
                    onClick={() => onViewChange('LEDGER')}
                />
                <NavButton
                    view="ARCHIVES"
                    icon={Scroll}
                    label="Archives"
                    current={activeView}
                    onClick={() => onViewChange('ARCHIVES')}
                />
            </div>
        </TooltipProvider>
    );
}

interface NavButtonProps {
    view: 'MAP' | 'LEDGER' | 'ARCHIVES';
    icon: LucideIcon;
    label: string;
    current: string;
    onClick: () => void;
}

function NavButton({ view, icon: Icon, label, current, onClick }: NavButtonProps) {
    const isActive = current === view;
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 group",
                isActive
                    ? "bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_-5px_hsl(var(--primary))]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
        >
            <Icon className={cn("size-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            <span className={cn(
                "font-serif text-sm tracking-wide",
                isActive ? "font-semibold" : ""
            )}>
                {label}
            </span>
        </button>
    )
}
