type State = {
  maxLevel: number;
  minLevel: number;
  apiKey: string;
  alwaysOnTop: boolean;
  keyBinds: any;
  version_max: string;
  version_current: string;
};

type Version = {
  max: string;
  current: string;
};

export default {
  namespaced: true,
  state: {
    maxLevel: null,
    minLevel: null,
    apiKey: null,
    alwaysOnTop: false,
    keyBinds: [],
    version_max: null,
    version_current: null,
  },
  getters: {
    maxLevel: (state: State) => state.maxLevel,
    minLevel: (state: State) => state.minLevel,
    apiKey: (state: State) => state.apiKey,
    keyBinds: (state: State) => state.keyBinds,
    version_max: (state: State) => state.version_max,
    version_current: (state: State) => state.version_current,
    alwaysOnTop: (state: State) => state.alwaysOnTop,
  },
  mutations: {
    UPDATE_USERSETTINGS(
      state: State,
      { maxLevel, minLevel, api_key, alwaysOnTop }: { maxLevel?: string; minLevel?: string; api_key?: string; alwaysOnTop?: number | boolean }
    ) {
      if (maxLevel) state.maxLevel = +maxLevel;
      if (minLevel !== undefined) state.minLevel = +minLevel;
      if (api_key) state.apiKey = api_key;
      if (alwaysOnTop !== undefined) state.alwaysOnTop = !!(+alwaysOnTop as any);
    },
    UPDATE_ALWAYS_ON_TOP(state: State, enabled: boolean) {
      state.alwaysOnTop = !!enabled;
    },
    UPDATE_APIKEY(state: State, { api_key }: { api_key: string }) {
      state.apiKey = api_key;
    },
    UPDATE_MAXLEVEL(
      state: State,
      { maxLevel }: { maxLevel: string; api_key: string }
    ) {
      state.maxLevel = +maxLevel;
    },
    UPDATE_MINLEVEL(
      state: State,
      { minLevel }: { minLevel: string }
    ) {
      state.minLevel = +minLevel;
    },
    UPDATE_KEYBINDS(state: State, data: any) {
      state.keyBinds = data;
    },
    SET_VERSION(state: State, { max, current }: Version) {
      state.version_current = current;
      state.version_max = max;
    },
  },
  actions: {
    init({ commit, dispatch }: any) {
      // Return a Promise so the app can wait for settings to load before mounting
      return new Promise<void>((resolve) => {
        // Ensure preload API is available; retry if not yet injected
        if (!window.api) {
          setTimeout(() => {
            dispatch("init").then(resolve);
          }, 100);
          return;
        }

        // First, run any pending database migrations
        window.api.send("runVersionUpdate");
        window.api.receive("resolveVersionUpdate", () => {
          // After migrations are complete, fetch version and settings
          window.api.send("fetchVersion");
          window.api.receive("resolveVersion", (data) => {
            commit("SET_VERSION", data);
          });

          window.api.send("fetchUsersettings");
          window.api.receive("resolveUsersettings", (data) => {
            commit("UPDATE_USERSETTINGS", data);
            // Apply window on-top state at startup
            try {
              window.api.send("setAlwaysOnTop", !!(data?.alwaysOnTop));
            } catch {}
            // Resolve the promise now that settings are loaded
            resolve();
          });
        });
      });
    },
    saveAPIKey({ commit }: any, data: { api_key: string }) {
      window.api.send("updateSettings", data);
      commit("UPDATE_APIKEY", data);
    },
    saveMaxLevel({ commit }: any, data: { maxLevel: string }) {
      window.api.send("updateSettings", data);
      commit("UPDATE_MAXLEVEL", data);
    },
    saveMinLevel({ commit }: any, data: { minLevel: string }) {
      window.api.send("updateSettings", data);
      commit("UPDATE_MINLEVEL", data);
    },
    async fetchKeybinds({ commit }: any) {
      window.api.send("fetchKeybinds");

      return new Promise((resolve) => {
        window.api.receive("resolveKeybinds", (data) => {
          commit("UPDATE_KEYBINDS", data);
          resolve(data);
        });
      });
    },
    saveAlwaysOnTop({ commit }: any, enabled: boolean) {
      const payload = { alwaysOnTop: enabled ? 1 : 0 } as any;
      window.api.send("updateSettings", payload);
      window.api.send("setAlwaysOnTop", !!enabled);
      commit("UPDATE_ALWAYS_ON_TOP", !!enabled);
    },
    async newKeybind({ commit }: any, data: any) {
      return new Promise(async (resolve) => {
        window.api.send("updateKeybind", data);
        window.api.send("fetchKeybinds");
        window.api.receive("resolveKeybinds", (data) => {
          commit("UPDATE_KEYBINDS", data);
          resolve(data);
        });
      });
    },
  },
  modules: {},
};
