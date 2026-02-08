import { defineStore } from "pinia";
import { invoke } from "@tauri-apps/api/core";

export interface BlockedGuild {
  guild_id: number;
  guild_name: string;
}

export const useBlocklistStore = defineStore("blocklist", {
  state: () => ({
    blockedGuilds: [] as BlockedGuild[],
  }),

  getters: {
    blockedIds: (state): Set<number> =>
      new Set(state.blockedGuilds.map((g) => g.guild_id)),
  },

  actions: {
    async init() {
      this.blockedGuilds = await invoke<BlockedGuild[]>("fetch_blocked_guilds");
    },

    isBlocked(guildId: number): boolean {
      return this.blockedIds.has(guildId);
    },

    async blockGuild(guildId: number, guildName: string) {
      await invoke("block_guild", { guildId, guildName });
      this.blockedGuilds.push({ guild_id: guildId, guild_name: guildName });
    },

    async unblockGuild(guildId: number) {
      await invoke("unblock_guild", { guildId });
      this.blockedGuilds = this.blockedGuilds.filter(
        (g) => g.guild_id !== guildId,
      );
    },
  },
});
