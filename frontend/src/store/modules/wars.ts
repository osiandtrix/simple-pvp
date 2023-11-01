import { createStore } from "vuex";

export default {
  namespaced: true,
  state: {
    wars: [],
  },
  getters: {
    wars: (state) => state.wars,
  },
  mutations: {
    UPDATE_WARS(state, data) {
      state.wars = data;
    },
  },
  actions: {
    init({ commit }) {
      window.api.send("fetchWarEnties");

      window.api.receive("resolveWarEntries", (data) => {
        commit("UPDATE_WARS", data);
      });
    },
  },
  modules: {},
};
