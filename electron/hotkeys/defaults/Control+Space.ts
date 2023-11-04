import { globalShortcut } from "electron";
import Keybind from "../../types/Keybind";

const Control_Space: Keybind = {
  defaultKey: "Control+Space",
  description: "Go to the previous target",
  effect: (alternate?: string) => {
    globalShortcut.register(
      (alternate ?? Control_Space.defaultKey)
        .replace("Control", "CommandOrControl")
        .replace("ArrowLeft", "Left")
        .replace("ArrowRight", "Right")
        .replace("ArrowUp", "Up")
        .replace("ArrowDown", "Down"),
      () => {
        global.mainWindow?.webContents.send(Control_Space.defaultKey);
      }
    );
  },
};

export default Control_Space;
