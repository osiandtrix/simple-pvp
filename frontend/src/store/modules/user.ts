export default {
  namespaced: true,
  state: async () => ({
    userId: null,
    guildId: null,
  }),
  getters: {
    userId: (state: any) => state.userId,
    guildId: (state: any) => state.guildId,
  },
  mutations: {
    UPDATE_USERDATA(
      state: any,
      { userId, guildId }: { userId: string; guildId: string }
    ) {
      state.userId = userId;
      state.guildId = guildId;
    },
    SET_USERID(state: any, { userId }: { userId: string }) {
      state.userId = userId;
    },
    SET_GUILDID(state: any, { guildId }: { guildId: string }) {
      state.guildId = guildId;
    },
  },
  actions: {
    init({ commit }: any) {
      window.api.send("fetchUserdata");

      window.api.receive("resolveUserdata", (data: any) => {
        commit("UPDATE_USERDATA", data);
      });
    },
    setUserId({ commit }: any, data: { userId: string }) {
      window.api.send("setUserId", data);

      commit("SET_USERID", data);
    },
    setGuildId({ commit }: any, data: { guildId: string }) {
      window.api.send("setGuildId", data);

      commit("SET_GUILDID", data);
    },
  },
  modules: {},
};
