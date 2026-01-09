# Walkthrough - The Hidden Covenant

## Phase 2: Simulation & Juice Update

I have implemented the "Simulation" mechanics and overhauled the visuals.

### 1. System Arcana (Offline Engine)
-   **The Living World**: The game now tracks when you close it.
-   **Entropy**: Threats calculate growth while you sleep based on exponential scaling. `Threat = Threat * (1 + rate)^time`.
-   **Visual**: A new **Threat Monitor** widget in the sidebar shows the current danger levels constantly.

### 2. The Rituals (Recurrence)
-   **The Interrogation**: On startup, if you have overdue tasks (simulated for now), a modal appears.
-   **Consequences**: You must report: "It Is Done" (Reward) or "I Failed" (Penalty).

### 3. Visual Overhaul
-   **Assets**: Added `study_background.png`, `paper_texture.png`, and threat icons.
-   **Aesthetic**:
    -   Dark Victorian Study background (now covers full game loop).
    -   Paper texture overlays.
    -   "Threats" widget redesigned for legibility.

### 4. Ruin (Game Over)
-   **Threshold**: If any Threat reaches **100**, the Covenant falls.
-   **Screen**: A "Ruin" screen appears, allowing you to wipe the save and restart.

## Phase 3: Agency & Precision (In Progress)

I have enabled the **Sovereign's Agency** (CRUD).

### 1. The Ledger (CRUD)
-   **Draft Decree**: You can now create custom Operations/Procols.
-   **Amend**: Click the "Edit" pencil on card hover to modify title/description.
-   **Abolish**: Delete protocols that are no longer needed.
-   **Timeouts**: You can set a timeout (in minutes). If the protocol expires before completion, it is removed and a penalty (Entropy) is applied.

## How to Run
1.  **Start**:
    ```bash
    npm run dev
    ```

## Verification
-   Create a "Test Protocol".
-   Edit it.
-   Delete it.
-   Create one with a 1-minute timeout and wait for it to expire (watch the console/history log).

### 5. Test Difficulty Selection
1.  Refresh the page to return to the Main Menu.
2.  **Verify Selector**: You should see "Select Difficulty" with **Easy**, **Medium**, **Hard**.
3.  **Select Hard**: Choose "Hard".
4.  **Begin**: Click **Begin Lineage**.
5.  **Verify**: Threats should grow noticeably faster compared to Easy.
