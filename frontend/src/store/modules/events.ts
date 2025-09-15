import Event from "../../types/Event";

type State = {
  events: Array<Event>;
};

export default {
  namespaced: true,
  state: {
    events: [],
  },
  getters: {
    events: (state: State) => state.events,
  },
  mutations: {
    NEW_EVENT(state: State, newEvent: Event) {
      state.events.push(newEvent);
    },
    RESET_EVENTS(state: State) {
      state.events = [];
    },
  },
  actions: {
    push({ commit }: any, event: Event) {
      let eventText;

      switch (event.type) {
        case "attack":
          eventText = `[${event.userId}] ${event.userName} attacked.`;
          break;
        case "hit":
          eventText = `[${event.userId}] ${event.userName} marked as 'hit'`;
          break;
        case "nothit":
          eventText = `[${event.userId}] ${event.userName} marked as 'not hit'`;
          break;
        default:
          break;
      }

      event.text = eventText;

      commit("NEW_EVENT", event);
    },
    reset({ commit }: any) {
      commit("RESET_EVENTS");
    },
  },
  modules: {},
};
