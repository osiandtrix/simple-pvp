import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  globalShortcut,
  ipcMain,
  screen,
} from "electron";
import path from "path";
import { isDev } from "./setup/config";
import { appConfig } from "./ElectronStore/Configuration";
import AppUpdater from "./setup/AutoUpdate";
import listeners from "./listeners";
import registerKeybinds from "./listeners/misc/registerKeybinds";
import unregisterKeybinds from "./listeners/misc/unregisterKeybinds";
import cronjobs from "./cronjobs";
import { CronJob } from "cron";
import Logger from "./ext/Logger";
import "./database/functions/init";

// Register all listeners
for (const [event, callback] of Object.entries(listeners)) {
  Logger.log("info", `Registering listener [${event}]`);
  ipcMain.on(event, callback);
}

// Register all cronjobs
for (const job of cronjobs) {
  new CronJob(job.cronTime, job.onTick as any, null, job.start, job.timeZone);
}

let mainWindow: BrowserWindow;
async function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const appBounds: any = appConfig.get("setting.appBounds");

  const BrowserWindowOptions: BrowserWindowConstructorOptions = {
    width: 500,
    minWidth: 500,
    height: 750,
    minHeight: 200,
    x: 100,
    y: 50,

    webPreferences: {
      preload: __dirname + "/setup/preload.js",
      devTools: isDev,
    },
    show: false,
    alwaysOnTop: false,
    frame: true,
  };

  if (appBounds !== undefined && appBounds !== null)
    Object.assign(BrowserWindowOptions, appBounds);

  mainWindow = new BrowserWindow(BrowserWindowOptions);
  global.mainWindow = mainWindow;

  // auto updated
  if (!isDev) AppUpdater();

  await mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "./index.html")}`
  );

  if (
    appBounds !== undefined &&
    appBounds !== null &&
    appBounds.width > width &&
    appBounds.height > height
  )
    mainWindow.maximize();
  else mainWindow.show();

  // this will turn off always on top after opening the application
  setTimeout(() => {
    mainWindow.setAlwaysOnTop(false);
  }, 1000);

  // Open the DevTools.
  // if (isDev) mainWindow.webContents.openDevTools();

  ipcMain.handle("versions", () => {
    return {
      node: process.versions.chrome,
      chrome: process.versions.chrome,
      electron: process.versions.electron,
      version: app.getVersion(),
      name: app.getName(),
    };
  });

  mainWindow.on("blur", () => {
    global.mainWindowBlurred = true;

    if (global.combatWindowBlurred) unregisterKeybinds();
  });

  mainWindow.on("focus", () => {
    global.mainWindowBlurred = false;

    if (!global.inCombat) return;

    unregisterKeybinds();
    registerKeybinds(null);
  });
}

app.whenReady().then(async () => {
  // if (isDev) {
  try {
    const { installExt } = await import("./setup/installDevTools");
    await installExt();
  } catch (e) {
    console.log("Can not install extension!");
  }
  // }

  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform === "darwin") return;

  app.quit();
});

app.on("will-quit", () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});
