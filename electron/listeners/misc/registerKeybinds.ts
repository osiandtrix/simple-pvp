import keybinds from "../../hotkeys";
import Remap from "../../types/Remap";

const registerKeybinds = (event: any) => {
  const remap: Array<Remap> = require("../../hotkeys/remap").default;

  for (const bind of keybinds) {
    bind.effect(
      remap.find((e: Remap) => e.original_key === bind.defaultKey)?.new_key
    );
  }
};

export default registerKeybinds;
