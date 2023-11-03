type Keybind = {
  description: string;
  defaultKey: string;
  remapKey?: string;
  effect: (alternate?: string) => void;
};

export default Keybind;
