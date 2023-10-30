import { createStore } from "vuex";

export default createStore({
  state: {
    counter: 0,
  },
  getters: {
    counter: (state) => state.counter,
  },
  mutations: {
    UPDATE_COUNTER(state, newValue) {
      state.counter = newValue;
    },
  },
  actions: {
    updateCounter({ commit }, newValue) {
      commit("UPDATE_COUNTER", newValue);
    },
  },
  modules: {},
});
