import { createStore } from "vuex";

export default {
  namespaced: true,
  state: {
    maxLevel: null,
  },
  getters: {
    maxLevel: (state) => state.maxLevel,
  },
  mutations: {
    UPDATE_USERSETTINGS(state, data) {
      state.maxLevel = data.maxLevel;
    },
  },
  actions: {
    init({ commit }) {
      window.api.send("fetchUsersettings");

      window.api.receive("resolveUsersettings", (data) => {
        commit("UPDATE_USERSETTINGS", data);
      });
    },
  },
  modules: {},
};
