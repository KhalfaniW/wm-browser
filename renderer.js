const { ipcRenderer } = require("electron");

document.getElementById("url-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const urlInput = document.getElementById("url-input");
  const statusDiv = document.getElementById("status");
  const url = urlInput.value.trim();

  if (!url) {
    statusDiv.textContent = "Please enter a URL";
    return;
  }

  try {
    const success = await ipcRenderer.invoke("navigate", url);
    if (success) {
      statusDiv.textContent = "Navigation successful";
      urlInput.value = "";
    } else {
      throw new Error("Navigation failed");
    }
  } catch (error) {
    statusDiv.textContent = `Failed to navigate: ${error.message}`;
  }
});
