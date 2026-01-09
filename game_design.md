# Game Design Document: The Hidden Covenant

## High Concept
You are the **Grandmaster** of an ancient, invisible order (Your Will). You do not "do chores"; you execute **Operations** to maintain the stability of the Realm (Your Life) against the encroaching void of **Entropy**, **Stagnation**, and **Solitude**.

## Theme & Aesthetic
**Style**: Paradox Interactive (Victoria 3 / Crusader Kings 3) meets *The Secret World* or *Cultist Simulator*.
**Visuals**:
-   **Materials**: Mahogany wood, aged paper, gold leaf accents, heavy ink.
-   **Atmosphere**: Dimly lit "Map Room" or "Study".
-   **Typography**: Elegant Serifs (e.g., Cinzel, Playfair Display) for headers, clean Monospace for numbers/data.

## Core Mechanics

### 1. The Economy (The Ledger)
The "Greed" comes from optimization and stacking modifiers, seeing your "Empire's" efficiency rating climb.
-   **Influence (Wealth/Career)**: Gained from professional tasks. Used to "purchase" Assets (e.g., Better tools, Courses).
-   **Order (Environment)**: Gained from cleaning/organizing. Combats *Entropy*.
-   **Connection (Social)**: Gained from family/friends tasks. Combats *Solitude*.

**The "Paradox" Tooltip**:
Hovering over "Order" should show:
```
Monthly Order Change: +15.2
  + 10.0 (Base)
  +  5.0 (Clean House Modifer)
  +  2.0 (Relic: The Dyson Vacuum)
  -  1.8 (Entropy Decay)
```

### 2. Operations (Chores)
Low-impact renaming. Serious, but clear.
-   **Real Task**: "Do the Dishes"
-   **In-Game**: "Sanitation Protocol" or "Restore Estate Hygiene".
-   **Real Task**: "Call Mom"
-   **In-Game**: "Strengthen Alliance: Matriarch".

### 3. The Threats (Enemies)
These are creeping bars or counters that grow if neglected.
-   **Entropy**: The natural decay of order (Mess). High Entropy reduces the effectiveness of all other actions (clutter makes thinking hard).
-   **Stagnation**: The enemy of progress. Grows when you delay "Project" type tasks.
-   **Solitude**: The void of isolation. Grows when "Connection" tasks are ignored.

### 4. Progression: "The Archives"
-   **Doctrines (Habits)**: Unlocking permanent buffs by maintaining streaks (e.g., "Doctrine of the Morning Lark": +5% Order gain if first task is done before 9 AM).
-   **Assets (Items)**: buying a new chair isn't just spending money; it's equipping an item that gives "+2 Comfort, +5% Work Efficiency".

## MVP Features
1.  **The Desk (Dashboard)**: Central view of the Map/State.
2.  **The Ledger (Task List)**: Add/Check off Operations.
3.  **The Calculator**: A complex state engine that tracks not just "Current Resources" but "Change per Tick/Day" based on active tasks.
4.  **Persistence**: Save state locally.
