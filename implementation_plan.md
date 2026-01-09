# Implementation Plan - Map View (Domain of Influence)

The "Map" will serve as a visual dashboard of the player's struggle, representing their life as a Sanctuary surrounded by the Void. It provides immediate, intuitive feedback on the state of Resources vs. Threats without relying on numbers.

## Goal
Create an immersive `MapView` component that visualizes the player's state with **high-end, premium abstract visuals**.

**Visual Metaphors V2:**
-   **THE SUN (Core):** Always present. Glow intensity driven by **Connection** (Light).
-   **INFLUENCE (Richness):** Adds ornate golden structures/filigree hugging close to the sun.
-   **ORDER (Planets):** High Order spawns orbiting planets/satellites.
-   **ENTROPY (Fracture):** Violent line disruption, displacing the planets and breaking the ornate rings.
-   **STAGNATION (Frost):** A creeping ice/vine texture that freezes the screen edges and slows time.

## User Review Required
> [!IMPORTANT]
> - **Planets:** Use smooth orbiting circles, not ticks.
> - **Frost:** Use an SVG texture overlay for Stagnation.
> - **Core:** Must feel solid and persistent.

## Proposed Changes

### Desktop App (`desktop-app/src`)

#### [MODIFY] `src/presentation/views/MapView.tsx`
- **Sun:** Base opacity 1.0. Glow radius scales with `Connection`.
- **Planets (Order):** Render `N` circles orbiting at different radii based on `Order`.
- **Filigree (Influence):** intricate SVG paths (spirograph style) near center.
- **Stagnation Overlay:** A static SVG overlay with `mix-blend-overlay` white/blue texture that fades in.
- **Entropy Filter:** Stronger `feTurbulence` + `feDisplacementMap` applied globally or to specific layers.

#### [MODIFY] `src/presentation/components/layout/Shell.tsx`
- Import and render `MapView` when `view === 'MAP'`.

## Verification Plan

### Manual Verification
1.  **Start Game:** Ensure Map defaults to "Ledger" (already done) but switch to "Map" to verify rendering.
2.  **State Reaction:**
    - Use console/devtools or gameplay to modify resources.
    - Verify:
        - Additional `INFLUENCE` -> Brighter Core.
        - High `ENTROPY` -> Shield appears cracked/jittery.
        - High `STAGNATION` -> Animations slow down.
