import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

document.getElementById("grip")!.addEventListener("mousedown", () => {
  appWindow.startDragging();
});

document.getElementById("back-btn")!.addEventListener("click", () => {
  invoke("combat_overlay_action", { action: "back" });
});

document.getElementById("next-btn")!.addEventListener("click", () => {
  invoke("combat_overlay_action", { action: "next" });
});
