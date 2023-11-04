import { globalShortcut } from "electron";
import Keybind from "../../types/Keybind";

const Control_ArrowLeft: Keybind = {
  defaultKey: "Control+ArrowLeft",
  description: "Mark the last player as 'not hit'",
  effect: (alternate?: string) => {
    globalShortcut.register(
      (alternate ?? Control_ArrowLeft.defaultKey)
        .replace("Control", "CommandOrControl")
        .replace("ArrowLeft", "Left")
        .replace("ArrowRight", "Right")
        .replace("ArrowUp", "Up")
        .replace("ArrowDown", "Down"),
      () => {
        global.mainWindow?.webContents.send(Control_ArrowLeft.defaultKey);
      }
    );
  },
};

export default Control_ArrowLeft;
