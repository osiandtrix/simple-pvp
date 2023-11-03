import { globalShortcut } from "electron";

const unregisterKeybinds = () => {
  globalShortcut.unregisterAll();
};

export default unregisterKeybinds;
