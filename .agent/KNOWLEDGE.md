# AGENT KNOWLEDGE BASE: The Hidden Covenant

## 1. High-Level Summary
**The Hidden Covenant** is a React/Zustand productivity RPG.
*   **Core Loop**: User performs real-world tasks -> Gains Resources (Influence, Order, Connection) -> Buys Assets/Doctrines -> Reduces Threats (Entropy, Stagnation, Solitude).
*   **Achievements**: Tracks milestones (Wealth, Survival, Risk) and unlocks badges. Persistent across runs.
*   **Threats**: Grow exponentially over time (calculated in `tick()` and `processOfflineProgress()`). Game over if any Threat >= 100.
*   **Persistence**: `localStorage` via `zustand/middleware/persist`.

## 2. Key Files & Structure
| Path | Responsibility |
| :--- | :--- |
| `src/application/store.ts` | **GOD OBJECT**. Contains state, actions, `tick()` loop, offline calculation. |
| `src/domain/resources.ts` | Enum `ResourceType` (INFLUENCE, ORDER, CONNECTION). |
| `src/domain/threats.ts` | Enum `ThreatType` (ENTROPY, STAGNATION, SOLITUDE). |
| `src/domain/logic.ts` | Interfaces for `Operation` and `Modifier`. |
| `src/domain/events.ts` | Event definitions, `GameEvent` type, triggering logic. |
| `src/domain/achievements.ts` | Achievement definitions and condition logic. |
| `src/domain/history.ts` | `HistoryEntry` type, structured log defs. |

## 3. Cheatsheet & Constants

### Resources
*   `INFLUENCE`: Career/Money.
*   `ORDER`: Cleaning/Stability.
*   `CONNECTION`: Social.

### Threats
*   **Limit**: 100 (Game Over).
*   **Growth Formula**: `dT/dt = r + (current * (r * 0.1))` (Exponential).
*   **Base Rates (`r`)**:
    *   EASY: 0.000009 (~1 mo)
    *   MEDIUM: 0.000040 (~1 wk)
    *   HARD: 0.000100 (~3 days)

### Operations
*   Have `cost` (Resources).
*   Have `rewards` (Resources, Threat Reduction).
*   Can grant `modifiers`.

## 4. Common Tasks

### Adding a New Mechanic
1.  Define types in `src/domain`.
2.  Add state to `SocietyState` in `src/application/store.ts`.
3.  Add logic to `tick()` or actions in `store.ts`.
4.  Update UI to reflect change.

### Modifying Growth Rates
*   Look for `growthRate` in `store.ts` (both inside `tick()` and `processOfflineProgress()`).
*   **WARNING**: Update BOTH locations to ensure consistency.

### Debugging
*   Check `localStorage.getItem('society-storage')` to see raw state.
*   `reset()` action in store clears everything to initial defaults.
