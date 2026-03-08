import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, nativeTheme, shell } from "electron";
import { join } from "path";
import { registerApis } from "src/lib/api";

const createWindow = (): void => {
  nativeTheme.themeSource = "light";

  const mainWindow = new BrowserWindow({
    width: 750,
    height: 750,
    show: false,
    minWidth: 500,
    minHeight: 500,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    trafficLightPosition: {
      x: 14,
      y: 14,
    },
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
};

const createConfirmWindow = (): void => {
  const confirmWindow = new BrowserWindow({
    width: 400,
    height: 200,
    // titleBarStyle: "hidden",
    modal: true,
    parent: BrowserWindow.getFocusedWindow() || undefined,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  confirmWindow.loadFile(join(__dirname, "../renderer/confirm.html"));
};

let newCardWindow: BrowserWindow | null = null;

const ensureNewCardWindow = (): BrowserWindow => {
  if (newCardWindow && !newCardWindow.isDestroyed()) return newCardWindow;

  const params = new URLSearchParams({ mode: "new-card" });

  newCardWindow = new BrowserWindow({
    width: 480,
    height: 520,
    minWidth: 400,
    minHeight: 400,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 14, y: 14 },
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  newCardWindow.on("close", (e) => {
    if (newCardWindow && !newCardWindow.isDestroyed()) {
      e.preventDefault();
      newCardWindow.hide();
      newCardWindow.webContents.send("reset-new-card");
    }
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    newCardWindow.loadURL(
      `${process.env["ELECTRON_RENDERER_URL"]}?${params.toString()}`,
    );
  } else {
    newCardWindow.loadFile(join(__dirname, "../renderer/index.html"), {
      search: params.toString(),
    });
  }

  return newCardWindow;
};

const showNewCardWindow = (deckId: string | null): void => {
  const win = ensureNewCardWindow();
  win.webContents.send("show-new-card", deckId);
  win.show();
  win.focus();
};

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.flashcards");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on("open-confirm-window", () => {
    createConfirmWindow();
  });

  ipcMain.handle("open-new-card-window", (_, deckId: string | null) => {
    showNewCardWindow(deckId);
  });

  ipcMain.handle("is-new-card-window-visible", () => {
    return newCardWindow !== null && !newCardWindow.isDestroyed() && newCardWindow.isVisible();
  });

  // Pre-warm the new card window
  ensureNewCardWindow();

  ipcMain.on("invalidate-queries", (event, queryKeys: string[]) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.webContents.id !== event.sender.id) {
        win.webContents.send("invalidate-queries", queryKeys);
      }
    }
  });

  ipcMain.removeAllListeners("api");

  registerApis();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => {
  // Destroy the pre-warmed window so it doesn't prevent quit
  if (newCardWindow && !newCardWindow.isDestroyed()) {
    newCardWindow.removeAllListeners("close");
    newCardWindow.destroy();
    newCardWindow = null;
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("open-settings", async (_) => {
  try {
    await shell.openPath("/Users/khalid/Developer/flashcardsv2/settings.json");
  } catch (e) {
    console.log("fail");
    console.log(e);
  }
});
