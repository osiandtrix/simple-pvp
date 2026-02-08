import { defineStore } from "pinia";
import { invoke } from "@tauri-apps/api/core";

interface UserData {
  userid: number;
  guildid: number;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    userId: null as number | null,
    guildId: null as number | null,
  }),

  actions: {
    async init() {
      const data = await invoke<UserData | null>("fetch_userdata");
      if (data) {
        this.userId = data.userid;
        this.guildId = data.guildid;
      }
    },

    async setUser(userId: number, guildId: number) {
      await invoke("update_userdata", { userid: userId, guildid: guildId });
      this.userId = userId;
      this.guildId = guildId;
    },
  },
});
