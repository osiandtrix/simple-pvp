import { globalShortcut } from "electron";
import Keybind from "../../types/Keybind";

const h: Keybind = {
  defaultKey: "h",
  description: "Go to Folen the Healer",
  effect: (alternate?: string) => {
    globalShortcut.register(
      (alternate ?? h.defaultKey)
        .replace("Control", "CommandOrControl")
        .replace("ArrowLeft", "Left")
        .replace("ArrowRight", "Right")
        .replace("ArrowUp", "Up")
        .replace("ArrowDown", "Down"),
      () => {
        global.combatWindow?.loadURL(
          `https://web.simple-mmo.com/healer?new_page=true`
        );
      }
    );
  },
};

export default h;
