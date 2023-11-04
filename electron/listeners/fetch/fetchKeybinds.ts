import keybinds from "../../hotkeys";
import Keybind from "../../types/Keybind";
import Remap from "../../types/Remap";

const fetchKeybinds = async (event: any) => {
  const remap: Array<Remap> = global.db?.prepare(`SELECT * FROM remaps`).all();

  event.reply(
    "resolveKeybinds",
    JSON.parse(
      JSON.stringify(
        keybinds.map((e: Keybind) => ({
          ...e,
          remapKey: remap.find((re) => re.original_key === e.defaultKey)
            ?.new_key,
        }))
      )
    )
  );
};

export default fetchKeybinds;
