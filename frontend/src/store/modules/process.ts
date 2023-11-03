type State = {
  apiLimit: number;
  apiLimit_Stamp: number | null;
  inCombat: boolean;
};

const getUNIXStamp = () => Math.floor(new Date().getTime() / 1000);

export default {
  namespaced: true,
  state: {
    apiLimit: 0,
    apiLimit_Stamp: null,
    inCombat: false,
  },
  getters: {
    apiLimit: (state: State) => state.apiLimit,
    apiLimit_Stamp: (state: State) => state.apiLimit_Stamp,
    inCombat: (state: State) => state.inCombat,
    resetIn: (state: State) =>
      60 - (getUNIXStamp() - (state.apiLimit_Stamp ?? 0)),
  },
  mutations: {
    UPDATE_INCOMBAT(state: State, val: boolean) {
      state.inCombat = val;
    },
    UPDATE_APILIMIT(state: State) {
      if (state.apiLimit === 0) state.apiLimit_Stamp = getUNIXStamp();

      state.apiLimit++;
    },
    RESET_APILIMIT(state: State) {
      if (!state.apiLimit_Stamp) return;
      if (Math.floor(new Date().getTime() / 1000) - state.apiLimit_Stamp < 60)
        return;

      state.apiLimit = 0;
      state.apiLimit_Stamp = null;
    },
    SET_APILIMIT(state: State, newValue: number) {
      if (!state.apiLimit_Stamp) state.apiLimit_Stamp = getUNIXStamp();

      state.apiLimit = newValue;
    },
  },
  actions: {
    init({ commit }: any) {
      window.api.receive("setCombatState", (data: boolean) => {
        commit("UPDATE_INCOMBAT", data);
      });

      setInterval(() => {
        commit("RESET_APILIMIT");
      }, 100);
    },
    setInCombat({ commit }: any, val: boolean) {
      commit("UPDATE_INCOMBAT", val);
    },
    updateApiLimit({ commit }: any) {
      commit("UPDATE_APILIMIT");
    },
    setApiLimit({ commit }: any, newValue: number) {
      commit("SET_APILIMIT", newValue);
    },
  },
  modules: {},
};
