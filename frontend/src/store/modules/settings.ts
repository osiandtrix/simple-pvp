export default {
  namespaced: true,
  state: {
    maxLevel: null,
    apiKey: null,
  },
  getters: {
    maxLevel: (state: any) => state.maxLevel,
    apiKey: (state: any) => state.apiKey,
  },
  mutations: {
    UPDATE_USERSETTINGS(
      state: any,
      { maxLevel, api_key }: { maxLevel: string; api_key: string }
    ) {
      state.maxLevel = maxLevel;
      state.apiKey = api_key;
    },
    UPDATE_APIKEY(state: any, { api_key }: { api_key: string }) {
      state.apiKey = api_key;
    },
    UPDATE_MAXLEVEL(
      state: any,
      { maxLevel }: { maxLevel: string; api_key: string }
    ) {
      state.maxLevel = maxLevel;
    },
  },
  actions: {
    init({ commit }: any) {
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
  },
  modules: {},
};
