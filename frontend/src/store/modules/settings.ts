type State = {
  maxLevel: number;
  apiKey: string;
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
    apiKey: null,
    keyBinds: [],
    version_max: null,
    version_current: null,
  },
  getters: {
    maxLevel: (state: State) => state.maxLevel,
    apiKey: (state: State) => state.apiKey,
    keyBinds: (state: State) => state.keyBinds,
    version_max: (state: State) => state.version_max,
    version_current: (state: State) => state.version_current,
  },
  mutations: {
    UPDATE_USERSETTINGS(
      state: State,
      { maxLevel, api_key }: { maxLevel: string; api_key: string }
    ) {
      if (maxLevel) state.maxLevel = +maxLevel;
      if (api_key) state.apiKey = api_key;
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
    UPDATE_KEYBINDS(state: State, data: any) {
      state.keyBinds = data;
    },
    SET_VERSION(state: State, { max, current }: Version) {
      state.version_current = current;
      state.version_max = max;
    },
  },
  actions: {
    init({ commit }: any) {
      window.api.send("fetchVersion");
      window.api.receive("resolveVersion", (data) => {
        commit("SET_VERSION", data);
      });

      window.api.send("fetchUsersettings");
      window.api.receive("resolveUsersettings", (data) => {
        commit("UPDATE_USERSETTINGS", data);
      });
    },
    saveAPIKey({ commit }: any, data: { apiKey: string }) {
      window.api.send("updateSettings", data);
      commit("UPDATE_APIKEY", data);
    },
    saveMaxLevel({ commit }: any, data: { maxLevel: string }) {
      window.api.send("updateSettings", data);
      commit("UPDATE_MAXLEVEL", data);
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
