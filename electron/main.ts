import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  screen,
} from "electron";
import path from "path";
import { isDev } from "./setup/config";
import { appConfig } from "./ElectronStore/Configuration";
import AppUpdater from "./setup/AutoUpdate";
import listeners from "./listeners";

import DBMigrations from "./database";
import * as DBFunctions from "./database/functions";

import "./database/functions/init";

(async function init() {
  const versionsToPatch: any = await DBMigrations;

  for (const version of versionsToPatch) {
    for (const change of version.default.changes) {
      if (change.type === "create") DBFunctions.create(change);
    }

    DBFunctions.versionUpdate(version.default.version);
  }
})();

for (const [functionName, func] of Object.entries(listeners)) {
  ipcMain.on(functionName, func);
}

async function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const appBounds: any = appConfig.get("setting.appBounds");

  const BrowserWindowOptions: BrowserWindowConstructorOptions = {
    width: 1200,
    minWidth: 900,
    height: 750,
    minHeight: 600,

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

  const mainWindow = new BrowserWindow(BrowserWindowOptions);

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
}

app.whenReady().then(async () => {
  if (isDev) {
    try {
      const { installExt } = await import("./setup/installDevTools");
      await installExt();
    } catch (e) {
      console.log("Can not install extension!");
    }
  }

  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform === "darwin") return;

  app.quit();
});
