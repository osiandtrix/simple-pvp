import { defineStore } from "pinia";
import { invoke } from "@tauri-apps/api/core";

export interface War {
  attacker: string;
  attacker_id: number;
  attacker_kills: number;
  defender: string;
  defender_id: number;
  defender_kills: number;
}

export interface Target {
  user_id: number;
  name: string;
  level: number;
  current_hp: number;
  max_hp: number;
}

export const useWarsStore = defineStore("wars", {
  state: () => ({
    warlist: [] as War[],
    activeGuildIndex: 0,
    targets: [] as Target[],
    targetIndex: 0,
  }),

  getters: {
    currentWar: (state) => state.warlist[state.activeGuildIndex] ?? null,
    currentTarget: (state) => state.targets[state.targetIndex] ?? null,
  },

  actions: {
    async init() {
      this.warlist = await invoke<War[]>("fetch_war_entries");
    },

    async updateWars(guildId: number, apiKey: string) {
      const wars = await invoke<any[]>("fetch_guild_wars", { guildId, apiKey });
      this.warlist = wars.map((w) => ({
        attacker: w.guild_1.name,
        attacker_id: w.guild_1.id,
        attacker_kills: w.guild_1.kills,
        defender: w.guild_2.name,
        defender_id: w.guild_2.id,
        defender_kills: w.guild_2.kills,
      }));
      await invoke("update_warlist", { wars: this.warlist });
    },

    shuffleWars() {
      for (let i = this.warlist.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.warlist[i], this.warlist[j]] = [this.warlist[j], this.warlist[i]];
      }
    },

    async fetchTargets(guildId: number, apiKey: string, minLevel: number | null, maxLevel: number | null) {
      const newTargets = await invoke<Target[]>("fetch_targets", {
        guildId,
        apiKey,
        minLevel,
        maxLevel,
      });
      this.targets.push(...newTargets);
    },

    nextTarget() {
      if (this.targetIndex < this.targets.length - 1) {
        this.targetIndex++;
      }
    },

    previousTarget() {
      if (this.targetIndex > 0) {
        this.targetIndex--;
      }
    },

    setTargetIndex(index: number) {
      this.targetIndex = index;
    },

    nextGuild() {
      if (this.activeGuildIndex < this.warlist.length - 1) {
        this.activeGuildIndex++;
      } else {
        this.activeGuildIndex = 0;
      }
    },

    reset() {
      this.warlist = [];
      this.activeGuildIndex = 0;
      this.targets = [];
      this.targetIndex = 0;
    },
  },
});
