# The Hidden Covenant - Desktop Version

This is the standalone desktop version of The Hidden Covenant, built with Electron for Steam distribution.

## Development

```bash
# Install dependencies
npm install

# Run in development mode (with Electron)
npm run dev

# Build for production
npm run build

# Package for distribution
npm run dist        # Package for current platform
npm run dist:win    # Package for Windows
npm run dist:mac    # Package for macOS
npm run dist:linux  # Package for Linux
```

## Project Structure

- `src/` - React app source code (shared with web version)
- `electron/` - Electron main and preload scripts
- `build/` - Application icons for packaging
- `release/` - Built packages for distribution

## Next Steps

1. Install dependencies: `npm install`
2. Test build: `npm run dev`
3. Adapt store to use Electron Store instead of localStorage
4. Add Steam integration via Greenworks
5. Create application icons
6. Build and test package
