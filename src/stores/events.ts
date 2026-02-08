import { defineStore } from "pinia";

export interface CombatEvent {
  text: string;
  userId: number;
  userName: string;
  type: "attack" | "hit" | "nothit";
}

export const useEventsStore = defineStore("events", {
  state: () => ({
    events: [] as CombatEvent[],
  }),

  actions: {
    push(event: Omit<CombatEvent, "text">) {
      let text = "";
      switch (event.type) {
        case "attack":
          text = `[${event.userId}] ${event.userName} attacked.`;
          break;
        case "hit":
          text = `[${event.userId}] ${event.userName} marked as 'hit'`;
          break;
        case "nothit":
          text = `[${event.userId}] ${event.userName} marked as 'not hit'`;
          break;
      }
      this.events.push({ ...event, text });
    },

    clear() {
      this.events = [];
    },
  },
});
