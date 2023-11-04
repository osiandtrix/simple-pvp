import { globalShortcut } from "electron";
import Keybind from "../../types/Keybind";

const Control_ArrowDown: Keybind = {
  defaultKey: "Control+ArrowDown",
  description: "Mark the current player as 'not hit'",
  effect: (alternate?: string) => {
    globalShortcut.register(
      (alternate ?? Control_ArrowDown.defaultKey)
        .replace("Control", "CommandOrControl")
        .replace("ArrowLeft", "Left")
        .replace("ArrowRight", "Right")
        .replace("ArrowUp", "Up")
        .replace("ArrowDown", "Down"),
      () => {
        global.mainWindow?.webContents.send(Control_ArrowDown.defaultKey);
      }
    );
  },
};

export default Control_ArrowDown;
