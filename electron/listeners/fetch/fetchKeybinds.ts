import keybinds from "../../hotkeys";
import Keybind from "../../types/Keybind";
import Remap from "../../types/Remap";

const fetchKeybinds = async (event: any) => {
  const remap: Array<Remap> = global.db?.prepare(`SELECT * FROM remaps`).all();

  let data;
  try {
    data = keybinds.map((e: Keybind) => ({
      ...e,
      remapKey: remap.find((re) => re.original_key === e.defaultKey)?.new_key,
    }));
  } catch {}

  event.reply("resolveKeybinds", JSON.parse(JSON.stringify(data ?? "[]")));
};

export default fetchKeybinds;
