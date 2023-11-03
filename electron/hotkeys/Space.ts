import { globalShortcut } from "electron";
import Keybind from "../types/Keybind";

const Space: Keybind = {
  defaultKey: "Space",
  description: "Go to the next target",
  effect: (alternate?: string) => {
    globalShortcut.register(alternate ?? Space.defaultKey, () => {
      global.mainWindow?.webContents.send("spacebar");
    });
  },
};

export default Space;
