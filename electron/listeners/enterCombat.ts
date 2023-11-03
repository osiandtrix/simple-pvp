import { BrowserWindow, screen } from "electron";

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

      event.reply("setCombatState", false);
      global.combatWindow = null;
    });

    global.combatWindow.webContents.on("did-finish-load", async () => {
      if (!global.combatWindow) return;

      let display = screen.getPrimaryDisplay();
      let width = display.bounds.width;

      global.combatWindow.setPosition(width - 600, 50);
    });

    global.combatWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription, url) => {
        console.log("Failed to load URL:", url);
        console.log("Error code:", errorCode);
        console.log("Error description:", errorDescription);
      }
    );
  }

  global.combatWindow.loadURL(
    `https://web.simple-mmo.com/user/attack/${target.user_id}`
  );
};

export default enterCombat;
