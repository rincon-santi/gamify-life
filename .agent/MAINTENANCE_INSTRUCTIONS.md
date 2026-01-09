# AGENT MAINTENANCE INSTRUCTIONS

## 1. Golden Rules
1.  **Read `KNOWLEDGE.md` First**: Before touching the code, refresh your context.
2.  **Update Documentation**: If you change logic in `src/domain` or `src/application`, you **MUST** update:
    *   `docs/game_mechanics.md` (if rules changed).
    *   `docs/architecture.md` (if implementation details changed).
    *   `.agent/KNOWLEDGE.md` (if constants/formulas changed).
3.  **Keep Code & Docs Sync**: Documentation that lies is worse than no documentation.

## 2. Trigger-Action Rules

### "I am modifying `store.ts`..."
*   **CHECK**: Are you changing how `tick()` works?
    *   **IF YES**: You MUST update `processOfflineProgress()` to match the logic. Offline calculation is a simulation of `tick()` over time.
    *   **IF YES**: Update `docs/architecture.md`.

### "I am adding a new Resource or Threat..."
*   **ACTION**: Update `src/domain/resources.ts` or `threats.ts`.
*   **ACTION**: Update `docs/game_mechanics.md`.
*   **ACTION**: Update `.agent/KNOWLEDGE.md` cheatsheet.

### "I am changing the difficulty scaling..."
*   **ACTION**: Update the math in `tick()` AND `processOfflineProgress()`.
*   **ACTION**: Update the "Growth Mechanics" section in `docs/game_mechanics.md`.
