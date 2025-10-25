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
      global.ignoreKeybinds = false;

      unregisterKeybinds();
    });

    // Apply saved Always-on-top preference to the combat window
    try {
      const row = global.db
        .prepare("SELECT alwaysOnTop FROM settings LIMIT 1")
        .get();
      const flag = row ? !!(+row.alwaysOnTop) : false;
      global.combatWindow.setAlwaysOnTop(
        flag,
        flag ? ("screen-saver" as any) : ("normal" as any)
      );
    } catch (e) {
      // Ignore if column doesn't exist yet or DB is unavailable
    }

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

      if (!global.inCombat) return;

      unregisterKeybinds();
      registerKeybinds(null);
    });
  }

  global.combatWindow.loadURL(
    `https://web.simple-mmo.com/user/attack/${target.user_id}`
  );

  global.inCombat = true;

  global.db
    .prepare(
      `INSERT INTO stats(start) VALUES('${Math.floor(
        new Date().getTime() / 1000
      )}')`
    )
    .run();
};

export default enterCombat;
