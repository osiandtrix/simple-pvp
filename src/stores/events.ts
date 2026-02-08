import { defineStore } from "pinia";

export interface CombatEvent {
  text: string;
  userId: number;
  userName: string;
  type: "attack";
}

export const useEventsStore = defineStore("events", {
  state: () => ({
    events: [] as CombatEvent[],
  }),

  actions: {
    push(event: Omit<CombatEvent, "text">) {
      const text = `[${event.userId}] ${event.userName} attacked.`;
      this.events.push({ ...event, text });
    },

    clear() {
      this.events = [];
    },
  },
});
