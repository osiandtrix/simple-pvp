import { createStore } from "vuex";
import user from "./modules/user";
import settings from "./modules/settings";

export default createStore({
  modules: { user, settings },
});
