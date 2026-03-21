import { defineStore } from "pinia";

export interface CombatEvent {
  text: string;
  userId: number;
  userName: string;
  type: "attack" | "skip";
}

export const useEventsStore = defineStore("events", {
  state: () => ({
    events: [] as CombatEvent[],
    sessionStart: null as number | null,
  }),

  getters: {
    killsPerHour: (state) => {
      if (!state.sessionStart || state.events.length === 0) return 0;
      const elapsed = (Date.now() - state.sessionStart) / 3600000;
      if (elapsed < 0.001) return 0;
      return Math.round(state.events.length / elapsed);
    },
  },

  actions: {
    push(event: Omit<CombatEvent, "text">) {
      if (!this.sessionStart) this.sessionStart = Date.now();
      const text =
        event.type === "skip"
          ? `[${event.userId}] ${event.userName} — 3x killed, skipped`
          : `[${event.userId}] ${event.userName} attacked.`;
      this.events.push({ ...event, text });
    },

    clear() {
      this.events = [];
      this.sessionStart = null;
    },
  },
});
