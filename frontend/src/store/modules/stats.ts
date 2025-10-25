type State = {
  kills: number;
  start: number | null;
  end: number | null;
  now: number; // seconds
};

const getNowSec = () => Math.floor(Date.now() / 1000);

export default {
  namespaced: true,
  state: {
    kills: 0,
    start: null,
    end: null,
    now: getNowSec(),
  },
  getters: {
    sessionKills: (state: State) => state.kills,
    sessionStart: (state: State) => state.start,
    sessionEnd: (state: State) => state.end,
    killsPerHour: (state: State) => {
      if (!state.start) return 0;
      const endRef = state.end ?? state.now;
      const elapsedSeconds = Math.max(0, endRef - state.start);
      const hours = elapsedSeconds / 3600;
      if (hours <= 0) return 0;
      const kph = state.kills / hours;
      return Number.isFinite(kph) ? kph : 0;
    },
  },
  mutations: {
    SET_SESSION(state: State, { start, end, kills }: { start: number | null; end: number | null; kills: number }) {
      state.start = start ?? null;
      state.end = end ?? null;
      state.kills = kills ?? 0;
      state.now = getNowSec();
    },
    INCREMENT_KILL(state: State) {
      state.kills += 1;
      state.now = getNowSec();
    },
    SET_NOW(state: State) {
      state.now = getNowSec();
    },
  },
  actions: {
    init({ commit }: any) {
      // Request current open session (if any)
      window.api.send("fetchSessionStats");
      window.api.receive("resolveSessionStats", (data: any) => {
        commit("SET_SESSION", data || { start: null, end: null, kills: 0 });
      });

      // Periodically tick so KPH updates over time
      setInterval(() => commit("SET_NOW"), 30_000);
    },
    increment({ commit }: any) {
      commit("INCREMENT_KILL");
    },
    refresh({ dispatch }: any) {
      // Re-fetch from backend in case of drift
      window.api.send("fetchSessionStats");
      // resolve handler already wired in init
    },
  },
  modules: {},
};

