import { globalShortcut } from "electron";
import Keybind from "../../types/Keybind";

const Shift_ArrowDown: Keybind = {
  defaultKey: "Shift+ArrowDown",
  description: "Mark the current player as 'hit'",
  effect: (alternate?: string) => {
    globalShortcut.register(
      (alternate ?? Shift_ArrowDown.defaultKey)
        .replace("Control", "CommandOrControl")
        .replace("ArrowLeft", "Left")
        .replace("ArrowRight", "Right")
        .replace("ArrowUp", "Up")
        .replace("ArrowDown", "Down"),
      () => {
        global.mainWindow?.webContents.send(Shift_ArrowDown.defaultKey);
      }
    );
  },
};

export default Shift_ArrowDown;
