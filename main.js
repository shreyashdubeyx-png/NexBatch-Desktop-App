const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const START_URL = "https://ais-pre-a5hvjqc66aerxlyco5jzkx-49225910278.asia-east1.run.app/?id=152";
const TELEGRAM_URL = "https://t.me/NexBatch_1";

let telegramInviteShown = false;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: "NexBatch",
    icon: path.join(__dirname, "assets", "icon.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  win.loadURL(START_URL);

  // Keep external links out of the app window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Show the Telegram invitation on each fresh app launch.
  win.webContents.on("did-finish-load", async () => {
    if (win.isDestroyed() || telegramInviteShown) return;
    telegramInviteShown = true;
    const telegram = JSON.stringify(TELEGRAM_URL);
    const logoUrl = "https://raw.githubusercontent.com/";
    const script = `
      (() => {
        if (document.getElementById("nexbatch-join-overlay")) return;
        const overlay = document.createElement("div");
        overlay.id = "nexbatch-join-overlay";
        overlay.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:18px;font-family:Arial,sans-serif;";
        const card = document.createElement("div");
        card.style.cssText = "width:min(420px,94vw);box-sizing:border-box;background:#07111f;color:white;border:1px solid #13c9ee;border-radius:18px;padding:24px 22px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.5);";
        const heading = document.createElement("div");
        heading.textContent = "Welcome to NexBatch";
        heading.style.cssText = "font-size:24px;font-weight:800;margin:0 0 10px;";
        const message = document.createElement("div");
        message.textContent = "Join our Telegram channel for updates and support.";
        message.style.cssText = "font-size:14px;line-height:1.5;color:#c9d7e7;margin-bottom:22px;";
        const join = document.createElement("button");
        join.textContent = "Join Telegram";
        join.style.cssText = "display:block;width:100%;border:0;border-radius:10px;padding:13px 16px;background:linear-gradient(90deg,#087bff,#08c9dc);color:white;font-size:16px;font-weight:700;margin-bottom:10px;cursor:pointer;";
        join.addEventListener("click", () => {
          window.open(${telegram}, "_blank");
          overlay.remove();
        });
        const later = document.createElement("button");
        later.textContent = "Leave it this time";
        later.style.cssText = "border:0;background:transparent;color:#aab8ca;font-size:12px;padding:7px 10px;cursor:pointer;";
        later.addEventListener("click", () => overlay.remove());
        card.append(heading, message, join, later);
        overlay.append(card);
        document.documentElement.append(overlay);
      })();
    `;
    try { await win.webContents.executeJavaScript(script); } catch (e) {}
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
