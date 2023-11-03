import { globalShortcut } from "electron";

const setSpacebarKeybind = (event: any, update: boolean) => {
  if (update) {
    globalShortcut.register("Space", () => {
      global.mainWindow?.webContents.send("spacebar");
    });
  } else {
    globalShortcut.unregister("Space");
  }
};

export default setSpacebarKeybind;
