const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  send: (channel: any, data: any) => {
    // whitelist channels

    // let validChannels = ["fetchUserdata", "fetchUsersettings"];
    // if (validChannels.includes(channel)) {
    ipcRenderer.send(channel, data);
    // }
  },
  receive: (channel: any, func: any) => {
    // let validChannels = ["resolveUserdata", "resolveUsersettings"];
    // if (validChannels.includes(channel)) {
    //   // Deliberately strip event as it includes `sender`
    ipcRenderer.on(channel, (event, ...args) => func(...args));
    // }
  },
  removeAllListeners: (channel: any) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
