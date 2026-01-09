# Architecture & Tech Stack

## Tech Stack
*   **Frontend Framework**: React 18
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **State Management**: Zustand (+ Immer for immutability)
*   **Persistence**: `zustand/middleware/persist` (LocalStorage)

## Project Structure
```
src/
├── application/       # Application logic (Store, Hooks)
│   └── store.ts       # Main State Store (Zustand)
├── domain/            # Pure Business Logic & Types
│   ├── logic.ts       # Operation/Modifier Interfaces
│   ├── resources.ts   # Resource Definitions
│   ├── threats.ts     # Threat Definitions
│   ├── events.ts      # Random Event Logic
│   ├── achievements.ts # Achievement Definitions
│   └── history.ts     # History Entry Definitions
├── presentation/      # UI Components (React)
└── assets/            # Static assets
```

## State Management (`useSocietyStore`)
The core game loop and state live in `src/application/store.ts`.

### Key Features
1.  **Immutability**: Uses `immer` middleware for easy state updates.
2.  **Persistence**: Automatically saves state to `localStorage` under the key `society-storage`.
3.  **The Tick Loop**: A `tick()` function runs periodically to update game state (Threat growth, Modifier expiration).
4.  **Offline Calculation**: `processOfflineProgress` calculates state changes that happened while the app was closed.
5.  **Run State**: `hasStarted` selector determines if a run is active by checking history, achievements, and resource/threat deviations from initial values.

### Domain Logic
*   **Resources**: Defined in `src/domain/resources.ts`.
*   **Threats**: Defined in `src/domain/threats.ts`.
*   **Operations**: Interfaces in `src/domain/logic.ts`.

## Deployment
Builds to static files in `dist/`. Can be hosted on any static site host (Netlify, Vercel, GitHub Pages).
