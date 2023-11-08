import keybinds from "../../hotkeys";
import Remap from "../../types/Remap";
import unregisterKeybinds from "./unregisterKeybinds";

const registerKeybinds = (event: any) => {
  if (global.ignoreKeybinds) return;

  unregisterKeybinds();

  const remap: Array<Remap> = require("../../hotkeys/utils/remap").default();

  for (const bind of keybinds) {
    bind.effect(
      remap.find((e: Remap) => e.original_key === bind.defaultKey)?.new_key
    );
  }
};

export default registerKeybinds;
