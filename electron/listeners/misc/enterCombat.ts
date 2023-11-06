import { BrowserWindow, screen } from "electron";
import registerKeybinds from "./registerKeybinds";
import unregisterKeybinds from "./unregisterKeybinds";

const enterCombat = (event: any, target: any) => {
  if (!global.combatWindow) {
    global.combatWindow = new BrowserWindow({
      width: 500,
      minWidth: 500,
      height: 750,
      minHeight: 750,

      show: true,
      alwaysOnTop: false,
      frame: true,
    });

    global.combatWindow.on("close", () => {
      if (!global.combatWindow) return;

      global.combatWindow = null;
      event.reply("setCombatState", false);
      global.inCombat = false;
    });

    global.combatWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription, url) => {
        console.log("Failed to load URL:", url);
        console.log("Error code:", errorCode);
        console.log("Error description:", errorDescription);
      }
    );

    global.combatWindow.on("blur", () => {
      global.combatWindowBlurred = true;

      if (global.mainWindowBlurred) unregisterKeybinds();
    });

    global.combatWindow.on("focus", () => {
      global.combatWindowBlurred = false;

      if (global.inCombat) registerKeybinds(null);
    });
  }

  global.combatWindow.loadURL(
    `https://web.simple-mmo.com/user/attack/${target.user_id}`
  );

  global.inCombat = true;
};

export default enterCombat;
