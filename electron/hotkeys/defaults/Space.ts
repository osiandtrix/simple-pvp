import { globalShortcut } from "electron";
import Keybind from "../../types/Keybind";

const Space: Keybind = {
  defaultKey: "Space",
  description: "Go to the next target",
  effect: (alternate?: string) => {
    globalShortcut.register(
      (alternate ?? Space.defaultKey)
        .replace("Control", "CommandOrControl")
        .replace("ArrowLeft", "Left")
        .replace("ArrowRight", "Right")
        .replace("ArrowUp", "Up")
        .replace("ArrowDown", "Down"),
      () => {
        global.mainWindow?.webContents.send("spacebar");
      }
    );
  },
};

export default Space;
