# The Hidden Covenant: Developer's Guide

This guide is for the architects of the system. It covers the technical structure, state management, and how to extend the game.

---

## 1. Architecture Overview

The project follows a specific variation of **Clean Architecture**, adapting it for a React/Zustand frontend environment.

### Layers
1.  **Domain (`src/domain/`)**: Pure TypeScript business logic.
    -   Defines Types (Resources, Threats, Operations).
    -   Defines Data (Events list, Achievements list).
    -   **Rule**: NO React code, NO Store imports. Pure functions and data only.
2.  **Application (`src/application/`)**: State and Logic glue.
    -   **Store (`store.ts`)**: The Zustand store that holds the State.
    -   **Hooks**: Custom hooks to access state.
    -   **Logic**: The `tick()` function, offline calculation, event triggering.
3.  **Presentation (`src/presentation/`)**: UI / View Layer.
    -   **Views**: Top-level page components (LedgerView, MapView).
    -   **Components**: Reusable UI atoms (ResourceIcon, ThreatBar).
    -   **Rule**: UI components should display data and dispatch actions. Avoid complex logic in components.

---

## 2. Tech Stack

-   **Runtime**: Electron (Desktop App)
-   **Build Tool**: Vite (Fast HMR and bundling)
-   **Language**: TypeScript (Strict typing)
-   **UI Framework**: React 18
-   **Styling**: TailwindCSS
-   **State Management**: Zustand (+ Immer for mutability, Persist for localStorage)

---

## 3. State Management

The heart of the application is `useSocietyStore` in `src/application/store.ts`.

### Persistence
We use `persist` middleware.
-   **Storage Key**: `society-storage`
-   **Location**: `localStorage` (Electron handles this file-based in production).
-   **Offline**: When the app loads, `rehydrate` checks the last save time and runs `processOfflineProgress` to simulate the passage of time.

### The Tick Loop
A `useEffect` in `App.tsx` (or a main layout) triggers the `tick()` action every second.
`tick()` handles:
1.  **Passive Threat Growth**: Increases Entropy/Solitude based on difficulty.
2.  **Event Rolling**: Small chance to trigger a `GameEvent`.
3.  **Modifier Expiration**: Cleans up temporary buffs.

---

## 4. Key Files & Directories

| Path | Purpose |
| :--- | :--- |
| `src/domain/events.ts` | **The Event Database**. Add new narrative events here. |
| `src/domain/resources.ts` | Resource definitions & icons. |
| `src/domain/threats.ts` | Threat definitions & growth rates. |
| `src/domain/logic.ts` | Interfaces for Operations (Action/Ritual/Quest). |
| `src/presentation/views/` | Main screens (Map, Ledger, Archives, Settings). |

---

## 5. How To...

### Add a New Event
1.  Open `src/domain/events.ts`.
2.  Add a new object to the `GENERIC_EVENTS` array.
3.  **Required Fields**: `id`, `title`, `description`, `weight` (probability).
4.  **Triggers**: Use `triggerConditions` (e.g., `{ minThreat: { SOLITUDE: 50 } }`) to make it context-aware.
5.  **Choices**: Define 2-3 choices. Use `grantOperation` for Quest rewards.

### Add a New Achievement
1.  Open `src/domain/achievements.ts`.
2.  Add a new `Achievement` object.
3.  Update `src/application/store.ts` inside the `tick()` function (under `// Check Achievements`) to verify the condition.

### Modify Difficulty
1.  Open `src/domain/threats.ts`.
2.  Adjust `DIFFICULTY_CONFIG`.
3.  `baseGrowthRate` controls passive gain per tick.

---

## 6. Build & Release

The project uses `electron-builder`.
-   **Dev**: `npm run dev` (Vite server + Electron window)
-   **Build**: `npm run build` (Compiles React to `dist/`)
-   **Package**: `npm run release` (Packages into an `.exe` or `.dmg`)

> **Note**: Audio assets are handled by a custom script. See `AUDIO_INTEGRATION.md` for details.
