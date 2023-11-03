import Remap from "../types/Remap";

const remap = (): Array<Remap> =>
  global.db?.prepare(`SELECT * FROM remaps`).all() ?? [];

export default remap();
