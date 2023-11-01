import { createStore } from "vuex";

const fetchUserSettings = () => {
  // ipcRenderer("test");
  return { maxLevel: null };
};

export default {
  namespaced: true,
  state: async () => ({
    userId: null,
    guildId: null,
  }),
  getters: {
    userId: (state) => state.userId,
    guildId: (state) => state.guildId,
  },
  mutations: {
    UPDATE_USERDATA(state, { userId, guildId }) {
      state.userId = userId;
      state.guildId = guildId;
    },
  },
  actions: {
    init({ commit }) {
      window.api.send("fetchUserdata");

      window.api.receive("resolveUserdata", (data) => {
        commit("UPDATE_USERDATA", data);
      });
    },
  },
  modules: {},
};
