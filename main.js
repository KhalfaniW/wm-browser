const { app, BrowserWindow } = require("electron");
const puppeteer = require("puppeteer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { Subject } = require("rxjs");
const { debounceTime } = require("rxjs/operators");

// Setup logging
const logFile = path.join(__dirname, "window-events.log");
function logEvent(eventType, details) {
  const timestamp = Date.now();
  const logEntry = `${timestamp} [${eventType}] ${JSON.stringify(details)}\n`;
  fs.appendFileSync(logFile, logEntry);
}

let mainWindow;
let browser;
let puppeteerWindowId;
let lastBounds = null;

// Create a Subject for window move events
const windowMoveSubject = new Subject();

// Function to get window ID by title (using xdotool)
function getWindowIdByTitle(title) {
  return new Promise((resolve) => {
    exec(`xdotool search --name "${title}"`, (error, stdout) => {
      if (error) {
        console.error(`Error getting window ID: ${error}`);
        resolve(null);
        return;
      }
      const ids = stdout.trim().split("\n");
      resolve(ids[ids.length - 1]); // Get the most recent window with this title
    });
  });
}

// Function to position the Puppeteer window
function positionPuppeteerWindow(event) {
  if (!puppeteerWindowId) return;

  // Get Electron window position and size
  const bounds = mainWindow.getBounds();
  lastBounds = bounds;

  // Log start of move intent
  logEvent("window-move-start", {
    id: puppeteerWindowId,
    triggeredBy: event ? "move-event" : "manual-position",
    event: event ? event.type : null,
    bounds,
  });

  // If this is a manual position (initial setup), do it immediately
  if (!event) {
    executeWindowMove(bounds);
    return;
  }

  // Otherwise, emit to subject for debouncing
  windowMoveSubject.next(bounds);
}

// Execute the actual window move
function executeWindowMove(bounds) {
  const startTime = Date.now();
  const rightHalfX = bounds.x + Math.floor(bounds.width / 2);
  const rightHalfWidth = Math.floor(bounds.width / 2);

  // Use a single command for better performance
  exec(
    `xdotool windowmove ${puppeteerWindowId} ${rightHalfX} ${bounds.y} windowsize ${puppeteerWindowId} ${rightHalfWidth} ${bounds.height}`,
    (error) => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log the move event with duration
      logEvent("window-move-completed", {
        id: puppeteerWindowId,
        bounds,
        triggeredBy: "rxjs-debounced-move",
        duration_ms: duration,
        success: !error,
      });
    }
  );
}

async function createWindows() {
  // Create main Electron window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load Electron UI for the left half
  mainWindow.loadFile("index.html");

  // Wait for the window to be ready
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Launch Puppeteer browser
  browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--app=https://www.example.com"],
  });

  // Wait for browser to open
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Get Puppeteer window ID using xdotool
  puppeteerWindowId = await getWindowIdByTitle("Example Domain");
  if (!puppeteerWindowId) {
    console.error("Puppeteer window not found");
    return;
  }

  if (puppeteerWindowId) {
    // Setup RxJS subscription with proper debouncing
    windowMoveSubject
      .pipe(
        debounceTime(30) // Adjust timing as needed (8ms = ~120fps)
      )
      .subscribe((bounds) => {
        executeWindowMove(bounds);
      });

    // Initial positioning
    positionPuppeteerWindow();

    // Subscribe to window move events
    mainWindow.on("move", (e) => positionPuppeteerWindow(e));

    // Clean up when Electron window is closed
    mainWindow.on("closed", () => {
      if (browser) browser.close();
      mainWindow = null;
    });
  }
}

app.whenReady().then(createWindows);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
