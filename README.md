# New Browser

A custom browser application built with Electron and Puppeteer that provides a split-window browsing experience. The application displays a custom Electron UI on the left side and a controlled browser window on the right side, with synchronized window management.

## Features

- Synchronized window positioning
- Window event logging
- Linux window management using xdotool
- Custom Electron-based UI

## Prerequisites

- Node.js and npm
- Linux with xdotool installed
- X11 window system

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Usage

Start the application in development mode:

```bash
npm run dev
```

Start the application normally:

```bash
npm start
```

## Technical Details

The application uses:

- Electron v35.2.0 for the main application window
- Puppeteer v24.7.0 for browser control
- xdotool for window management
- Node.js built-in modules for file system operations and child processes

### Window Management

The application manages two windows:

1. Main Electron window (left half)
2. Puppeteer browser window (right half)

Window positions are synchronized using xdotool, and all window events are logged to `window-events.log`.

## Scripts

- `npm start` - Launch the application
- `npm run dev` - Launch with warning traces enabled
- `npm test` - Run tests (currently not implemented)

## License

ISC
