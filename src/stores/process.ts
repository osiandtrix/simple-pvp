import { defineStore } from "pinia";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export const useProcessStore = defineStore("process", {
  state: () => ({
    inCombat: false,
    apiRemaining: 40,
    apiResetIn: 0,
  }),

  getters: {
    apiLimitReached: (state) => state.apiRemaining <= 0,
  },

  actions: {
    async init() {
      await listen<boolean>("combat-state-changed", (event) => {
        this.inCombat = event.payload;
      });
    },

    async pollRateLimit() {
      try {
        const [remaining, resetSecs] = await invoke<[number, number]>("get_rate_limit");
        this.apiRemaining = remaining;
        this.apiResetIn = resetSecs;
      } catch {
        // Ignore errors
      }
    },

    setInCombat(val: boolean) {
      this.inCombat = val;
    },
  },
});
