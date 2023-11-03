import axios, { AxiosResponse } from "axios";
import { Warlist } from "../../types/war";

type State = {
  warlist: Warlist;
  activeGuildIndex: number;
  targets: Array<any>;
  targetIndex: number;
};

type params = {
  apiKey: string;
  guildId: number;
};

const rng = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min);

const shuffleArray = (array: Array<any>): Array<any> => {
  for (const [i] of Object.entries(array)) {
    const roll = rng(0, array.length - 1);
    [array[i as any], array[roll]] = [array[roll], array[i as any]];
  }

  return array;
};

export default {
  namespaced: true,
  state: {
    warlist: [],
    activeGuildIndex: 0,
    targets: [],
    targetIndex: 0,
  },
  getters: {
    warlist: (state: State) => state.warlist,
    activeGuildIndex: (state: State) => state.activeGuildIndex,
    targets: (state: State) => state.targets,
    targetIndex: (state: State) => state.targetIndex,
    currentWar: (state: State) => state.warlist[state.activeGuildIndex],
    currentTarget: (state: State) => state.targets[state.targetIndex],
  },
  mutations: {
    UPDATE_WARS(state: State, data: Array<any>) {
      state.warlist = data;
    },
    SHUFFLE_WARS(state: State) {
      state.warlist = shuffleArray(state.warlist);
    },
    UPDATE_GUILDINDEX(state: State, val: 1 | -1) {
      state.activeGuildIndex += val;
    },
    UPDATE_TARGETS(state: State, data: Array<any>) {
      state.targets = [...state.targets, ...data];
    },
    CHANGE_TARGET_INDEX(state: State, index: number) {
      state.targetIndex += index;
    },
    SET_TARGET_INDEX(state: State, index: number) {
      state.targetIndex = index;
    },
  },
  actions: {
    init({ commit }: any) {
      window.api.send("fetchWarEntries");

      window.api.receive("resolveWarEntries", (data: Warlist) => {
        commit("UPDATE_WARS", data);
      });

      window.api.receive("newTargets", (data: Array<any>) => {
        commit("UPDATE_TARGETS", data);
      });
    },
    shuffleWars({ commit }: any) {
      commit("SHUFFLE_WARS");
    },
    updateWars({ commit }: any, data: params) {
      const url = `https://api.simple-mmo.com/v1/guilds/wars/${data.guildId}/1`;

      return new Promise(async (resolve, reject) => {
        const res: AxiosResponse | void = await axios
          .post(url, { api_key: data.apiKey })
          .catch(() => {});

        if (!res) return reject();

        window.api.send("updateWarlist", res.data);
        commit("UPDATE_WARS", res.data);

        resolve(res.data);
      });
    },
    overwriteWarlist({ commit }: any, list: Array<any>) {
      window.api.send("updateWarlist", list);
    },
    getNextGuild({ commit }: any) {
      commit("UPDATE_GUILDINDEX", 1);
    },
    getPreviousGuild({ commit }: any) {
      commit("UPDATE_GUILDINDEX", -1);
    },
    async fetchTargets({ commit }: any, { guildId, apiKey, maxLevel }: any) {
      const url = `https://api.simple-mmo.com/v1/guilds/members/${guildId}`;

      return new Promise(async (resolve, reject) => {
        let error = null;
        const res = await axios
          .post(url, { api_key: apiKey })
          .catch((e) => (error = e));
        if (error) return reject(error);

        const filtered = res.data.filter(
          (target) =>
            target.safe_mode === 0 &&
            target.banned === 0 &&
            (target.level > 200 ||
              new Date() / 1000 - target.last_active >= 600) &&
            target.current_hp / target.max_hp >= 0.5 &&
            (maxLevel ? target.level <= maxLevel : true)
        );

        if (filtered && filtered.length > 0) commit("UPDATE_TARGETS", filtered);
        commit("UPDATE_GUILDINDEX", 1);

        console.log(this.targets);

        return resolve(filtered);
      });
    },
    changeTargetIndex({ commit }: any, index: number) {
      commit("CHANGE_TARGET_INDEX", index);
    },
    setTargetIndex({ commit }: any, index: number) {
      commit("SET_TARGET_INDEX", index);
    },
  },
  modules: {},
};
