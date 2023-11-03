import { globalShortcut } from "electron";
import Keybind from "../types/Keybind";

const f: Keybind = {
  defaultKey: "f",
  description: "Go to the food section of your Inventory",
  effect: (alternate?: string) => {
    globalShortcut.register(alternate ?? f.defaultKey, () => {
      global.combatWindow?.loadURL(
        `https://web.simple-mmo.com/inventory/items?itemname=&minlevel=&maxlevel=&type%5B%5D=Food`
      );
    });
  },
};

export default f;
