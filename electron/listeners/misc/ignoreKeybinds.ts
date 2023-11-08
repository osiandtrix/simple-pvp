import registerKeybinds from "./registerKeybinds";
import unregisterKeybinds from "./unregisterKeybinds";

const ignoreKeybinds = (event: any, value: boolean) => {
  global.ignoreKeybinds = value;

  if (value) unregisterKeybinds();
  else registerKeybinds(null);
};

export default ignoreKeybinds;
