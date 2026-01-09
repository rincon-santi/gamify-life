# Audio System Integration Guide

## Overview

The desktop app now includes a complete audio system with background music and sound effects.

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
