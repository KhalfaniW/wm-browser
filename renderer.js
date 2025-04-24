const { ipcRenderer } = require("electron");
const store = require("./store");
const {
  setUrl,
  startNavigation,
  navigationSuccess,
  navigationFailed,
} = require("./store/navigationSlice");

// Update UI based on store changes
store.subscribe(() => {
  const state = store.getState().navigation;
  const statusDiv = document.getElementById("status");
  const urlInput = document.getElementById("url-input");

  // Update status message
  if (state.error) {
    statusDiv.textContent = `Failed to navigate: ${state.error}`;
  } else if (state.status === "succeeded") {
    statusDiv.textContent = "Navigation successful";
    urlInput.value = "";
  } else if (state.status === "loading") {
    statusDiv.textContent = "Navigating...";
  }
});

document.getElementById("url-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const urlInput = document.getElementById("url-input");
  const url = urlInput.value.trim();

  if (!url) {
    store.dispatch(navigationFailed("Please enter a URL"));
    return;
  }

  try {
    store.dispatch(startNavigation());
    store.dispatch(setUrl(url));

    const success = await ipcRenderer.invoke("navigate", url);
    if (success) {
      store.dispatch(navigationSuccess());
    } else {
      throw new Error("Navigation failed");
    }
  } catch (error) {
    store.dispatch(navigationFailed(error.message));
  }
});
