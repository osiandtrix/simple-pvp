import { globalShortcut } from "electron";
import Keybind from "../../types/Keybind";

const Shift_ArrowLeft: Keybind = {
  defaultKey: "Shift+ArrowLeft",
  description: "Mark the last player as 'hit'",
  effect: (alternate?: string) => {
    globalShortcut.register(
      (alternate ?? Shift_ArrowLeft.defaultKey)
        .replace("Control", "CommandOrControl")
        .replace("ArrowLeft", "Left")
        .replace("ArrowRight", "Right")
        .replace("ArrowUp", "Up")
        .replace("ArrowDown", "Down"),
      () => {
        global.mainWindow?.webContents.send(Shift_ArrowLeft.defaultKey);
      }
    );
  },
};

export default Shift_ArrowLeft;
