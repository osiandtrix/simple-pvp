import fetchUserdata from "./fetch/fetchUserdata";
import fetchUsersettings from "./fetch/fetchUsersettings";
import fetchWarEntries from "./fetch/fetchWarEntries";
import updateSettings from "./update/updateSettings";
import updateUserdata from "./update/updateUserdata";
import updateWarlist from "./update/updateWarlist";
import enterCombat from "./misc/enterCombat";
import registerKeybinds from "./misc/registerKeybinds";
import updateCurrentTarget from "./update/updateCurrentTarget";
import unregisterKeybinds from "./misc/unregisterKeybinds";
import fetchKeybinds from "./fetch/fetchKeybinds";
import updateKeybind from "./update/updateKeybind";
import updateTargetHit from "./update/updateTargetHit";
import fetchTargetLogs from "./fetch/fetchTargetLogs";
import fetchVersion from "./fetch/fetchVersion";
import runVersionUpdate from "./misc/runVersionUpdate";
import installMigration from "./misc/installMigration";
import ignoreKeybinds from "./misc/ignoreKeybinds";

export default {
  fetchUserdata,
  fetchUsersettings,
  fetchWarEntries,
  updateSettings,
  updateUserdata,
  updateWarlist,
  enterCombat,
  registerKeybinds,
  updateCurrentTarget,
  unregisterKeybinds,
  fetchKeybinds,
  updateKeybind,
  updateTargetHit,
  fetchTargetLogs,
  fetchVersion,
  runVersionUpdate,
  installMigration,
  ignoreKeybinds,
};
