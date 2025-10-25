const setAlwaysOnTop = (event: any, enabled: boolean | number) => {
  try {
    const flag = !!enabled;
    const level: any = flag ? "screen-saver" : "normal";
    global.mainWindow?.setAlwaysOnTop(flag, level);
    global.combatWindow?.setAlwaysOnTop(flag, level);
  } catch (e) {
    // no-op
  }
};

export default setAlwaysOnTop;

