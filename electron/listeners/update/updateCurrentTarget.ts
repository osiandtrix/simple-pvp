const updateCurrentTarget = (event: any, userId: number) => {
  global.combatWindow?.loadURL(
    `https://web.simple-mmo.com/user/attack/${userId}`
  );
};

export default updateCurrentTarget;
