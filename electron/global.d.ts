import { BrowserWindow } from "electron";

declare global {
  var db: any;
  var mainWindow: BrowserWindow | null;
  var combatWindow: BrowserWindow | null;
  var mainWindowBlurred: boolean;
  var combatWindowBlurred: boolean;
  var inCombat: boolean = false;
  var ignoreKeybinds: boolean = false;
}
