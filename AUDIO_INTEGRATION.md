# Audio System Integration Guide

## Overview

The desktop app now includes a complete audio system with background music and sound effects.

## Background Music System

The app automatically scans for music playlists in the `resources/audio` folder (prod) or `public/audio` (dev).

### Directory Structure
To add music, create folders in `public/audio`. Each folder becomes a playlist.
```
public/audio/
  ├── Classical/
  │   ├── track1.mp3
  │   └── track2.mp3
  └── Ambient/
      ├── deep_space.ogg
      └── rain.wav
```

### Player
A music player widget will appear in the UI (bottom-right) when music is detected. It allows:
- Playlist selection
- Play/Pause/Skip
- Volume control (tied to Music Volume setting)
- **Spotify Mode**: Toggle between Local files and Spotify Embed.
  - Paste any Spotify Album or Playlist URL (e.g., `https://open.spotify.com/playlist/...`).
  - **Login**: Click "LOG IN TO SPOTIFY" to open a secure in-app popup. This logs you into Spotify within the app's session, enabling full track playback in the embed player.
  - The player will transform the URL into an embed player automatically.


## Using Audio in Components

### 1. Import the Audio Hook

```typescript
import { useAudio } from '../application/AudioContext';
```

### 2. Play Sound Effects

```typescript
const { playSound } = useAudio();

// In your event handlers:
onClick={() => playSound('click')}
onClick={() => playSound('achievement')}
onClick={() => playSound('questComplete')}
```

## Available Sound Effects

- `click` - UI button clicks
- `hover` - UI hover (subtle)
- `achievement` - Achievement unlocked
- `operationComplete` - Task completed
- `questAccept` - Quest accepted
- `questComplete` - Quest completed (success)
- `questFail` - Quest failed
- `threatWarning` - Threat warning (50+)
- `threatCritical` - Critical threat (80+)
- `gameOver` - Game over
- `resourceGain` - Resource increased
- `resourceLoss` - Resource decreased

## Integration Examples

### Achievement Unlock (in store.ts)

```typescript
// When achievement is unlocked
state.achievements.push(ach.id);
// Play sound via IPC or event system
window.dispatchEvent(new CustomEvent('playSound', { detail: 'achievement' }));
```

### Operation Complete

```typescript
const { playSound } = useAudio();

const handleExecute = () => {
  executeOperation(operation);
  playSound('operationComplete');
};
```

### Threat Warnings

Add to the store's `tick()` function to check threat levels and trigger warnings.

## Audio Settings

Users can control audio via the Settings panel in the main menu:
- Master Volume
- Music Volume
- Sound Effects Volume
- Mute Toggle

Settings persist in localStorage.

## Next Steps

1. **Generate Placeholder Audio**: Create silent or beep placeholders for testing
2. **Source Real Audio**: Get royalty-free music and SFX
3. **Add More Triggers**: Integrate sounds throughout the app based on game events
