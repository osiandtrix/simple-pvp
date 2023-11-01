import { createStore } from "vuex";
import user from "./modules/user";
import settings from "./modules/settings";
import wars from "./modules/wars";

export default createStore({
  modules: { user, settings, wars },
});
