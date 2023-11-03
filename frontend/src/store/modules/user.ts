type userIdDB = {
  userid: string;
};

type guildIdDB = {
  guildid: string;
};

type userId = {
  userId: string;
};

type guildId = {
  guildId: string;
};

type State = guildId & userId;

export default {
  namespaced: true,
  state: {
    userId: null,
    guildId: null,
  },
  getters: {
    userId: (state: State) => state.userId,
    guildId: (state: State) => state.guildId,
  },
  mutations: {
    UPDATE_USERDATA(state: State, { userid, guildid }: userIdDB & guildIdDB) {
      if (userid) state.userId = userid;
      if (guildid) state.guildId = guildid;
    },
    SET_USERID(state: State, { userId }: userId) {
      state.userId = userId;
    },
    SET_GUILDID(state: State, { guildId }: guildId) {
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
    setUserId({ commit }: any, data: userId) {
      window.api.send("updateUserdata", data);

      commit("SET_USERID", data);
    },
    setGuildId({ commit }: any, data: guildId) {
      window.api.send("updateUserdata", data);

      commit("SET_GUILDID", data);
    },
  },
  modules: {},
};
