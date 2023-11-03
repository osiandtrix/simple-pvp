import { BrowserWindow } from "electron";

declare global {
  var db: any;
  var mainWindow: BrowserWindow | null;
  var combatWindow: BrowserWindow | null;
}
