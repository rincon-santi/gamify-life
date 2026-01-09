# Game Mechanics & Rules

## 1. Resources (The Currency of Will)
Resources are the positive feedback loops of the game. They represent your capacity to affect the world.

| Resource | Description | Source |
| :--- | :--- | :--- |
| **Influence** | Political capital and wealth. Used to acquire Assets. | Professional/Career tasks. |
| **Order** | Stability and clarity. Combats Entropy. | Cleaning, organizing, sanitation. |
| **Connection** | Social bonds and allies. Combats Solitude. | Family, friends, socializing. |

## 2. Threats (The Encroaching Void)
Threats are creeping bars that grow over time (exponentially if neglected). If any Threat reaches **100**, the game is "Over" (representing a state of burnout or chaos).

| Threat | Description | Countered By |
| :--- | :--- | :--- |
| **Entropy** | The chaos of the physical realm. Decay/Mess. | **Order** generating tasks. |
| **Stagnation** | The rot of inaction. | Completing tasks regularly. |
| **Solitude** | The void of isolation. | **Connection** generating tasks. |

### Growth Mechanics
Threats grow exponentially based on the difficulty setting:
*   **Easy**: Negligible growth (~1 month to failure).
*   **Medium**: Moderate growth (~1 week to failure).
*   **Hard**: Rapid growth (~3 days to failure).
*   **Offline Progress**: The game simulates growth while you are away.

## 3. Operations (Actions)
Operations are the bridge between Real Life and the Game.

*   **Type**:
    *   `RITUAL`: Recurring habits.
    *   `QUEST`: One-off tasks.
    *   `ACTION`: Quick interactions.
*   **Cost**: Some operations require resources (e.g., spending Influence to buy an Asset).
*   **Rewards**: Gain Resources, reduce Threats, or gain Modifiers.

## 4. Modifiers (Buffs/Debuffs)
Modifiers affect the rate of change for Resources and Threats.
*   **Example**: "Clean House Modifier" might give +5.0 Monthly Order Change.
*   **Source**: Granted by completing specific Operations (e.g., "Deep Clean" operation grants a temporary "Sparkling Home" modifier).

## 5. Random Narrative Events
Events break the monotony of the loop, providing narrative texture and strategic choices.

### Design Philosophy
Events are designed to be **universally applicable** - situations that anyone can relate to, prompting concrete and useful actions:
- **Financial/Admin Procrastination**: Unopened bills, messy inboxes
- **Health & Wellness**: Sleep schedules, exercise, medical checkups
- **Relationships**: Forgotten birthdays, unanswered messages, social isolation
- **Personal Growth**: Learning goals, digital detox, combating procrastination
- **Household Chaos**: Lost items, maintenance issues

### Triggers
1.  **Random Tick Chance**: Every tick has a small chance (~0.3%) to trigger an event if none is active.
2.  **Offline Catch-up**: Returning after a long absence (>1 hour) has a significant chance (~50%) to present an event summarizing what happened.
3.  **Threat Conditions**: Specific events (e.g., "Broken Sleep Schedule") trigger only when specific threats reach thresholds, offering targeted interventions.

### Mechanics
*   **Choices**: Events present 2-3 choices (e.g., "Accept", "Reject", "Ignore").
*   **Outcomes**:
    *   **Quests**: Accepting an event often creates a temporary `QUEST` operation (e.g., "Sort Finances", "Movement Session").
    *   **Direct Impact**: Some choices immediately alter resources/threats (e.g., "Ignore conflict" -> +10 Solitude).
    *   **Risk**: Rejecting a call to action usually incurs a penalty.

## 6. Achievements (Badges of Honor)
Achievements track long-term progress and survival milestones.

*   **Categories**:
    *   **Wealth**: Accumulating resources (Influence, Order, Connection).
    *   **Survival**: Surviving for X days (scaled by Difficulty).
    *   **Risk**: Surviving high-threat situations (Brinkmanship).
    *   **Recovery**: Recovering from near-death states.
    *   **Event**: Participating in narrative events.
*   **Rewards**: Currently cosmetic (Badges), but serve as a permanent record of success.
*   **UI**: Accessible via the Trophy icon in the sidebar.
## 5. Achievements (Badges of Honor)
Achievements track long-term progress and survival milestones.
*   **Categories**:
    *   **Wealth**: Accumulating resources (Influence, Order, Connection).
    *   **Survival**: Surviving for X days (scaled by Difficulty).
    *   **Risk**: Surviving high-threat situations (Brinkmanship).
    *   **Recovery**: Recovering from near-death states.
    *   **Event**: Participating in narrative events.
*   **Rewards**: Currently cosmetic (Badges), but serve as a permanent record of success.
*   **UI**: Accessible via the Trophy icon in the sidebar.

## 6. Archives (The Records)
The Archives provide a history of the society's journey.
*   **Logs**: Every significant action (Event, Achievement, Task completion, Threat growth) is recorded.
*   **Structure**: Legacy logs are strings; new logs are structured objects with types and metadata.
*   **UI**: Filterable list in the "Archives" tab.

