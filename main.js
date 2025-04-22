const { app, BrowserWindow } = require("electron");
const puppeteer = require("puppeteer");
const { exec } = require("child_process");

let mainWindow;
let browser;
let puppeteerWindowId;

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
async function positionPuppeteerWindow() {
  if (!puppeteerWindowId) return;

  // Get Electron window position and size
  const bounds = mainWindow.getBounds();
  const rightHalfX = bounds.x + Math.floor(bounds.width / 2);
  const rightHalfWidth = Math.floor(bounds.width / 2);

  // Use xdotool to position and resize the Puppeteer window
  exec(
    `xdotool windowmove ${puppeteerWindowId} ${rightHalfX} ${bounds.y} windowsize ${puppeteerWindowId} ${rightHalfWidth} ${bounds.height}`
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
    // Initial positioning
    positionPuppeteerWindow();

    // Keep Puppeteer window in sync with Electron window movements
    mainWindow.on("move", positionPuppeteerWindow);

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
