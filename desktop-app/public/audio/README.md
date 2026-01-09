# Generating Audio Placeholders

## Quick Start

1. Open `generate-audio-placeholders.html` in your browser
2. Click "Generate All Sounds"
3. Click "Download All (ZIP)" or download individually
4. Move the `.wav` files to `public/audio/`
5. Rename them to `.mp3` (or update the audio paths in `useAudioManager.ts`)

## What Gets Generated

The generator creates simple beep sounds for:
- ✅ UI sounds (clicks, hovers)
- ✅ Game events (achievements, quests)
- ✅ Threats (warnings, game over)
- ✅ Resources (gains, losses)
- ✅ Background music (looping tone)

Each sound is a simple sine wave beep with different:
- **Frequencies** - Higher = brighter sound
- **Duration** - Short clicks vs. longer notifications
- **Patterns** - Single beep or ascending/descending tones

## Using the Files

### Option 1: Keep as WAV
The files are generated as `.wav` - you can use them as-is by updating `useAudioManager.ts`:

```typescript
const AUDIO_FILES = {
  bgMusic: '/audio/ambient-background.wav',
  click: '/audio/ui-click.wav',
  // ... etc
};
```

### Option 2: Convert to MP3
For smaller file sizes, convert to MP3 using:
- **Online**: https://cloudconvert.com/wav-to-mp3
- **FFmpeg**: `ffmpeg -i input.wav -codec:a libmp3lame -qscale:a 2 output.mp3`

## Next Steps

Once you have real audio:
1. Replace the beeps with properly composed music/SFX
2. Keep the same filenames for easy swap
3. Update the README.md in `/audio/` with licenses/credits
