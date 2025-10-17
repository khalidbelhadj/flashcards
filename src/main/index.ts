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

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.flashcards");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on("open-confirm-window", () => {
    createConfirmWindow();
  });

  registerApis();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
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
