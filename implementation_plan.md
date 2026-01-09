# Implementation Plan - The Hidden Covenant (MVP)

## Goal Description
Build a "Paradox-style" grand strategy application to gamify real-life chores. The user acts as the Grandmaster of a Secret Society.
**Platform Strategy**: We will build a **Desktop-First Web Application**.
-   **Why?**: Modern "Native" apps like Discord and VS Code are built with this exact stack.
-   **The Feel**: The app will NOT behave like a website. No scrolling, no browser context menus, fully immersive UI.
-   **Future Proof**: This codebase can be wrapped in **Tauri** or **Electron** later to become a true .exe application without rewriting logic.

## User Review Required
> [!IMPORTANT]
> **Art Direction**: Victorian/Secret Society. Aesthetic: Dark wood, parchment, gold leaf, ink.
> **Visuals**: Focus on **Data Visualization** (Graphs, Ledgers) and "Juicy" UI feedback (sound, distinct clicks) rather than particle overkill.
> **Platform**: React/Vite (Web Tech) but styled and architected as a **Desktop Application**.

## Proposed Changes

### Tech Stack
-   **Framework**: React (Vite).
-   **Styling**: Tailwind CSS + **Radix UI** (for accessible, complex interactive primitives).
-   **Visualization**: **Recharts** (Graphs) + **Framer Motion** (Layout transitions).
-   **State**: Zustand + Immer + Persist.

### Project Structure (New)
#### [NEW] [scaffold]
-   Setup Vite + React + TS.
-   **Critical**: Configure generic "Reset" CSS to remove all browser-like behaviors (scroll, select, touch highlight) to ensure "App-like" feel.

### Core Components
#### [NEW] [SocietyState]
-   Global store for Resources (Influence, Order, Connection) and Threats (Entropy, Stagnation, Solitude).
-   **Modifiers Engine**: The mathematical heart of the game.

#### [NEW] [TheLedger] (Task List)
-   Draggable, sortable "Operations".
-   Right-click context menus (custom implementation, not browser default).

#### [NEW] [MapRoom] (Dashboard)
-   Fixed-layout dashboard (Sidebar + Main View).
-   **Data-Dense**: Tooltips, sparklines, and progress bars everywhere.

## Verification Plan

### Automated Tests
-   Verify build using `npm run build`.

### Manual Verification
-   **"Immersion" Test**: Open the app in full screen (F11). Does it look like a website? If yes, it fails. It must look like a Game/App.
-   **Mechanic Test**: Verify resource modifiers stack correctly.
