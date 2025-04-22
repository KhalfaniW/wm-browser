const { app, BrowserWindow } = require("electron");
const puppeteer = require("puppeteer");
const { exec } = require("child_process");
const os = require("os");

let mainWindow;
let browser;
let puppeteerWindowId;
let isLinux = os.platform() === "linux";

// Function to execute shell commands with error handling
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command execution error: ${error}`);
        console.error(`stderr: ${stderr}`);
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// Function to get X11 window ID for a browser window
async function getX11WindowId(browserWindow) {
  if (!isLinux || !browserWindow) return null;
  const windowHandle = browserWindow.getNativeWindowHandle();
  const windowId = windowHandle.readUInt32LE(0);
  return windowId.toString();
}

// Function to get window ID by title (using xdotool)
async function getWindowIdByTitle(title) {
  if (!isLinux) return null;
  try {
    const result = await execCommand(`xdotool search --name "${title}"`);
    if (result) {
      const ids = result.split("\n");
      return ids[ids.length - 1]; // Get the most recent window with this title
    }
  } catch (error) {
    console.error("Error getting window ID:", error);
  }
  return null;
}

// Function to set Puppeteer window as child of Electron window
async function setPuppeteerAsChildWindow(electronWindowId, puppeteerWindowId) {
  if (!isLinux || !electronWindowId || !puppeteerWindowId) {
    console.log(
      "Window parenting is only supported on Linux with valid window IDs"
    );
    return;
  }
  console.log({ electronWindowId, puppeteerWindowId });
  try {
    // Use xdotool to reparent Puppeteer window to Electron window
    await execCommand(
      `xdotool windowreparent ${puppeteerWindowId} ${electronWindowId}`
    );
    console.log(
      "Successfully set Puppeteer window as child using xdotool windowreparent"
    );
  } catch (error) {
    console.error("Failed to reparent window with xdotool:", error);
  }
}

// Function to position the Puppeteer window
async function positionPuppeteerWindow() {
  if (!puppeteerWindowId || !isLinux) return;

  try {
    // Get Electron window position and size
    const bounds = mainWindow.getBounds();
    const rightHalfX = bounds.x + Math.floor(bounds.width / 2);
    const rightHalfWidth = Math.floor(bounds.width / 2);
    // console.log("resize", bounds.x, bounds.y, rightHalfX, rightHalfWidth);
    // Use xdotool to position and resize the Puppeteer window
    //await execCommand();
    //  `xdotool windowmove ${puppeteerWindowId} ${rightHalfX} ${bounds.y} windowsize ${puppeteerWindowId} ${rightHalfWidth} ${bounds.height}`
  } catch (error) {
    console.error("Failed to position Puppeteer window:", error);
  }
}

// Function to handle window state changes
async function syncWindowState(isMinimized) {
  if (!puppeteerWindowId || !isLinux) return;

  try {
    const action = isMinimized ? "windowminimize" : "windowactivate";
    await execCommand(`xdotool ${action} ${puppeteerWindowId}`);
  } catch (error) {
    console.error(
      `Failed to ${isMinimized ? "minimize" : "restore"} Puppeteer window:`,
      error
    );
  }
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

  // Wait for the window to be ready and fully loaded
  await new Promise((resolve) => {
    mainWindow.webContents.on("did-finish-load", resolve);
  });

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
    await positionPuppeteerWindow();

    // Get Electron window's X11 ID and set Puppeteer window as child
    const electronWindowId = await getX11WindowId(mainWindow);
    if (electronWindowId) {
      await setPuppeteerAsChildWindow(electronWindowId, puppeteerWindowId);
    } else {
      console.error("Failed to get Electron window ID");
    }

    // Keep Puppeteer window in sync with Electron window movements and state
    mainWindow.on("move", positionPuppeteerWindow);
    mainWindow.on("minimize", () => syncWindowState(true));
    mainWindow.on("restore", () => syncWindowState(false));
    mainWindow.on("show", () => syncWindowState(false));

    // Clean up when Electron window is closed
    mainWindow.on("closed", () => {
      if (browser) browser.close();
      mainWindow = null;
    });

    console.log("Window synchronization set up successfully");
  }
}

app.whenReady().then(createWindows);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
