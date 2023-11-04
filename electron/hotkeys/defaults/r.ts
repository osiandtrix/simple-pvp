import { globalShortcut } from "electron";
import Keybind from "../../types/Keybind";

const r: Keybind = {
  defaultKey: "r",
  description: "Go to energy refills",
  effect: (alternate?: string) => {
    globalShortcut.register(
      (alternate ?? r.defaultKey)
        .replace("Control", "CommandOrControl")
        .replace("ArrowLeft", "Left")
        .replace("ArrowRight", "Right")
        .replace("ArrowUp", "Up")
        .replace("ArrowDown", "Down"),
      () => {
        global.combatWindow?.loadURL(
          `https://web.simple-mmo.com/diamondstore/rewards/energy-points?new_page=true`
        );
      }
    );
  },
};

export default r;
