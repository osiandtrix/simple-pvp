import { defineStore } from "pinia";
import { listen } from "@tauri-apps/api/event";

export const useProcessStore = defineStore("process", {
  state: () => ({
    inCombat: false,
    apiRemaining: 40,
    apiResetAt: null as number | null,
  }),

  getters: {
    apiLimitReached: (state) => state.apiRemaining <= 0,
    resetInSeconds: (state) => {
      if (!state.apiResetAt) return 0;
      return Math.max(0, Math.ceil((state.apiResetAt - Date.now()) / 1000));
    },
  },

  actions: {
    async init() {
      await listen<boolean>("combat-state-changed", (event) => {
        this.inCombat = event.payload;
      });
    },

    trackApiCall() {
      this.apiRemaining = Math.max(0, this.apiRemaining - 1);
      if (this.apiRemaining === 0 && !this.apiResetAt) {
        this.apiResetAt = Date.now() + 60_000;
      }
    },

    checkApiReset() {
      if (this.apiResetAt && Date.now() >= this.apiResetAt) {
        this.apiRemaining = 40;
        this.apiResetAt = null;
      }
    },

    setInCombat(val: boolean) {
      this.inCombat = val;
    },
  },
});
