import axios from "axios";
import { Warlist } from "../../types/war";

type State = {
  warlist: Warlist;
  rawWarlist: Warlist;
  activeGuildIndex: number;
  targets: Array<any>;
  targetIndex: number;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  userGuildId: number | null;
};

type params = {
  apiKey: string;
  guildId: number;
};

const getDefaultState = () => ({
  warlist: [],
  rawWarlist: [],
  activeGuildIndex: 0,
  targets: [],
  targetIndex: 0,
  sortField: null,
  sortDirection: 'desc' as 'asc' | 'desc',
  userGuildId: null,
});

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
    rawWarlist: [],
    activeGuildIndex: 0,
    targets: [],
    targetIndex: 0,
    sortField: null,
    sortDirection: 'desc',
    userGuildId: null,
  },
  getters: {
    warlist: (state: State) => state.warlist,
    rawWarlist: (state: State) => state.rawWarlist,
    activeGuildIndex: (state: State) => state.activeGuildIndex,
    targets: (state: State) => state.targets,
    targetIndex: (state: State) => state.targetIndex,
    currentWar: (state: State) => state.warlist[state.activeGuildIndex],
    currentTarget: (state: State) => state.targets[state.targetIndex],
    sortField: (state: State) => state.sortField,
    sortDirection: (state: State) => state.sortDirection,
  },
  mutations: {
    UPDATE_WARS(state: State, data: Array<any>) {
      state.rawWarlist = data;
      state.warlist = data;
      // Note: Sorting will be applied by the action that calls this
    },
    SHUFFLE_WARS(state: State) {
      state.warlist = shuffleArray([...state.rawWarlist]);
      state.sortField = null; // Clear sorting when shuffling
    },
    SET_USER_GUILD_ID(state: State, guildId: number) {
      state.userGuildId = guildId;
    },
    SET_SORT(state: State, { field, direction }: { field: string | null, direction: 'asc' | 'desc' }) {
      state.sortField = field;
      state.sortDirection = direction;
    },
    APPLY_SORT(state: State) {
      if (!state.sortField || !state.userGuildId) {
        state.warlist = [...state.rawWarlist];
        return;
      }

      const sorted = [...state.rawWarlist].sort((a: any, b: any) => {
        let aValue, bValue;

        if (state.sortField === 'yourKills') {
          // Get your guild's kills for each war
          aValue = state.userGuildId === a.guild_1.id ? a.guild_1.kills : a.guild_2.kills;
          bValue = state.userGuildId === b.guild_1.id ? b.guild_1.kills : b.guild_2.kills;
        } else if (state.sortField === 'theirKills') {
          // Get enemy guild's kills for each war
          aValue = state.userGuildId === a.guild_1.id ? a.guild_2.kills : a.guild_1.kills;
          bValue = state.userGuildId === b.guild_1.id ? b.guild_2.kills : b.guild_1.kills;
        } else {
          return 0;
        }

        if (state.sortDirection === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });

      state.warlist = sorted;
      // Reset guild index when sorting changes
      state.activeGuildIndex = 0;
    },
    UPDATE_GUILD_INDEX(state: State, val: 1 | -1) {
      state.activeGuildIndex += val;
    },
    SET_GUILD_INDEX(state: State, val: number) {
      state.activeGuildIndex = val;
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
    RESET(state: State) {
      Object.assign(state, getDefaultState());
    },
  },
  actions: {
    async init({ commit }: any) {
      window.api.send("fetchWarEntries");

      window.api.receive("resolveWarEntries", (data: Warlist) => {
        commit("UPDATE_WARS", data);
      });

      window.api.receive("newTargets", (data: Array<any>) => {
        commit("UPDATE_TARGETS", data);
      });
    },
    reset({ commit }: any) {
      commit("RESET");
    },
    shuffleWars({ commit }: any) {
      commit("SHUFFLE_WARS");
    },
    setUserGuildId({ commit }: any, guildId: number) {
      commit("SET_USER_GUILD_ID", guildId);
    },
    sortWarlist({ commit, state }: any, { field, userGuildId }: { field: string, userGuildId: number }) {
      const currentSortField = state.sortField;
      const currentSortDirection = state.sortDirection;

      let newDirection: 'asc' | 'desc';

      if (currentSortField === field) {
        // Toggle direction if same field
        newDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // New field, start with descending (highest kills first)
        newDirection = 'desc';
      }

      commit("SET_USER_GUILD_ID", userGuildId);
      commit("SET_SORT", { field, direction: newDirection });
      commit("APPLY_SORT");
    },
    async updateWars({ commit }: any, { guildId, apiKey }: params) {
      const url = `https://api.simple-mmo.com/v1/guilds/wars/${guildId}/1`;

      return new Promise(async (resolve, reject) => {
        let error = null;
        const res = await axios
          .post(url, { api_key: apiKey })
          .catch((e) => (error = e));
        if (error) return reject(error);

        if (!res) return reject();

        window.api.send("updateWarlist", res.data);
        commit("UPDATE_WARS", res.data);

        resolve(res.data);
      });
    },
    overwriteWarlist(_: any, list: Array<any>) {
      window.api.send("updateWarlist", list);
    },
    getNextGuild({ commit }: any) {
      commit("UPDATE_GUILD_INDEX", 1);
    },
    getPreviousGuild({ commit }: any) {
      commit("UPDATE_GUILD_INDEX", -1);
    },
    async fetchTargets({ commit }: any, { guildId, apiKey, maxLevel, minLevel }: any) {
      const url = `https://api.simple-mmo.com/v1/guilds/members/${guildId}`;

      return new Promise(async (resolve, reject) => {
        let error = null;
        const res = await axios
          .post(url, { api_key: apiKey })
          .catch((e) => (error = e));
        if (error) return reject(error);

        window.api.send(
          "fetchTargetLogs",
          res.data.map((e: any) => e.user_id)
        );

        const filtered = res.data.filter(
          (target: any) =>
            target.safe_mode === 0 &&
            target.banned === 0 &&
            (target.level > 200 ||
              new Date().getTime() / 1000 - target.last_activity >= 600) &&
            target.current_hp / target.max_hp >= 0.5 &&
            (!maxLevel || target.level <= maxLevel) &&
            (!minLevel || target.level >= minLevel)
        );

        if (filtered && filtered.length > 0) commit("UPDATE_TARGETS", filtered);

        commit("UPDATE_GUILD_INDEX", 1);
        window.api.receive("resolveTargetLogs", (logs: any) => {
          const filter = (target: any) =>
            !logs?.find(
              (log: any) =>
                log.user_id === target.user_id &&
                ((logs.hits === 3 &&
                  Math.floor(new Date().getTime() / 1000) - logs.first_hit <=
                    43_200 &&
                  Math.floor(new Date().getTime() / 1000) - logs.first_hit >
                    46_800) ||
                  log.hits === 4)
            );

          return resolve(filtered.filter(filter));
        });
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
