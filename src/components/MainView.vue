<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Webview, getCurrentWebview } from "@tauri-apps/api/webview";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize, LogicalPosition } from "@tauri-apps/api/dpi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Swords, Save, Keyboard, LogOut, Loader2, UtensilsCrossed, HeartPulse, Zap } from "lucide-vue-next";
import { toast } from "vue-sonner";
import WarlistTable from "./WarlistTable.vue";
import EventLog from "./EventLog.vue";

import { useUserStore } from "@/stores/user";
import { useSettingsStore } from "@/stores/settings";
import { useWarsStore, type War } from "@/stores/wars";
import { useProcessStore } from "@/stores/process";
import { useEventsStore } from "@/stores/events";
import { useBlocklistStore } from "@/stores/blocklist";

const user = useUserStore();
const settings = useSettingsStore();
const wars = useWarsStore();
const process = useProcessStore();
const events = useEventsStore();
const blocklist = useBlocklistStore();

const CONTROLS_WIDTH = 500;
const COMBAT_WIDTH = 500;

const minLevel = ref(settings.minLevel ?? 0);
const maxLevel = ref(settings.maxLevel ?? 0);
const initiatingCombat = ref(false);
const singleGuildMode = ref(false);
const keybindsActive = ref(false);
let combatWindow: WebviewWindow | null = null;
let combatWebview: Webview | null = null;
let overlayWindow: WebviewWindow | null = null;
let attackInProgress = false;
let lastAttackTime = 0;
let resizeUnlisten: UnlistenFn | null = null;
let savedWindowWidth: number | null = null;
const emptyGuilds = new Set<number>(); // guilds that returned 0 targets this session

const unlisteners: UnlistenFn[] = [];

onMounted(async () => {
  minLevel.value = settings.minLevel ?? 0;
  maxLevel.value = settings.maxLevel ?? 0;

  // Expose overlay handlers so Rust can eval() them on this window
  (window as any).__overlayNext = () => advanceTarget();
  (window as any).__overlayBack = () => goBackTarget();

  unlisteners.push(
    await listen("Space", handleSpaceBar),
  );

  const interval = setInterval(() => process.pollRateLimit(), 1000);
  unlisteners.push(() => clearInterval(interval));
});

onUnmounted(() => {
  unlisteners.forEach((fn) => fn());
  delete (window as any).__overlayNext;
  delete (window as any).__overlayBack;
});

watch(() => settings.minLevel, (val) => {
  minLevel.value = val ?? 0;
});
watch(() => settings.maxLevel, (val) => {
  maxLevel.value = val ?? 0;
});

function hasCombatView(): boolean {
  return combatWindow !== null || combatWebview !== null;
}

async function isOnBlockedPage(): Promise<boolean> {
  if (!hasCombatView()) return false;
  try {
    const url = await invoke<string>("get_combat_url");
    return url.includes("/login") || url.includes("/chat/private");
  } catch {
    return false;
  }
}

async function showOverlay() {
  if (overlayWindow) return;
  overlayWindow = new WebviewWindow("overlay", {
    url: "overlay.html",
    title: "Controls",
    width: 150,
    height: 50,
    decorations: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
  });
  overlayWindow.once("tauri://destroyed", () => {
    overlayWindow = null;
  });
}

async function hideOverlay() {
  if (!overlayWindow) return;
  try { await overlayWindow.close(); } catch { /* already gone */ }
  overlayWindow = null;
}

async function toggleKeybinds() {
  if (!process.inCombat) return;
  if (keybindsActive.value) {
    await invoke("unregister_shortcuts");
    keybindsActive.value = false;
    await showOverlay();
  } else {
    await hideOverlay();
    await invoke("register_shortcuts");
    keybindsActive.value = true;
  }
}

async function saveLevels() {
  await settings.saveMinLevel(minLevel.value);
  await settings.saveMaxLevel(maxLevel.value);
  toast.success("Level filters saved");
}

async function enterCombat() {
  const hasUnblockedWars = wars.warlist.some((w) => {
    const opponentId = w.attacker_id === user.guildId ? w.defender_id : w.attacker_id;
    return !blocklist.isBlocked(opponentId);
  });
  if (!settings.apiKey || !hasUnblockedWars) return;
  initiatingCombat.value = true;
  singleGuildMode.value = false;

  try {
    // Check rate limit before trying to fetch
    await process.pollRateLimit();
    if (process.apiRemaining <= 2) {
      toast.warning(`Rate limited — resets in ${process.apiResetIn}s`);
      initiatingCombat.value = false;
      return;
    }

    await fetchTargets();

    if (!wars.currentTarget) {
      toast.warning("No targets found");
      initiatingCombat.value = false;
      return;
    }

    process.setInCombat(true);
    events.clear();
    await openCombatWindow(wars.currentTarget.user_id);
    await invoke("register_shortcuts");
    keybindsActive.value = true;
  } catch (e) {
    toast.error("Failed to enter combat");
  } finally {
    initiatingCombat.value = false;
  }
}

async function enterCombatForGuild(war: War) {
  if (!settings.apiKey) return;
  initiatingCombat.value = true;
  singleGuildMode.value = true;

  const guildId =
    war.attacker_id === user.guildId ? war.defender_id : war.attacker_id;

  try {
    wars.targets = [];
    wars.targetIndex = 0;
    await wars.fetchTargets(guildId, settings.apiKey, settings.minLevel, settings.maxLevel);

    if (!wars.currentTarget) {
      toast.warning("No targets found in that guild");
      return;
    }

    process.setInCombat(true);
    events.clear();
    await openCombatWindow(wars.currentTarget.user_id);
    await invoke("register_shortcuts");
    keybindsActive.value = true;
  } catch (e) {
    toast.error("Failed to load targets");
  } finally {
    initiatingCombat.value = false;
  }
}

async function fetchTargets() {
  let guildsFetched = 0;
  const bufferGoal = 5;

  while (wars.targets.length - wars.targetIndex < bufferGoal) {
    // Check rate limit before each API call — bail if exhausted
    await process.pollRateLimit();
    if (process.apiRemaining <= 2) {
      if (wars.targets.length > wars.targetIndex) break;
      toast.warning(`Rate limited — resets in ${process.apiResetIn}s`);
      break;
    }

    // Find next non-blocked, non-empty guild
    let guildId: number | null = null;
    let attempts = 0;
    while (attempts < wars.warlist.length) {
      const war = wars.currentWar;
      if (!war) break;
      const id =
        war.attacker_id === user.guildId ? war.defender_id : war.attacker_id;
      wars.nextGuild();
      attempts++;
      if (blocklist.isBlocked(id) || emptyGuilds.has(id)) continue;
      guildId = id;
      break;
    }

    if (guildId === null) break;

    guildsFetched++;

    try {
      const countBefore = wars.targets.length;
      await wars.fetchTargets(guildId, settings.apiKey!, settings.minLevel, settings.maxLevel);
      if (wars.targets.length === countBefore) {
        emptyGuilds.add(guildId);
      }
    } catch {
      // Guild fetch failed, continue to next
    }

    // Tried all non-empty guilds
    if (guildsFetched >= wars.warlist.length) break;
  }
}

async function openCombatWindow(userId: number) {
  const url = `https://web.simple-mmo.com/user/attack/${userId}`;

  if (settings.embeddedCombat) {
    await openEmbeddedCombat(url);
  } else {
    await openExternalCombat(url);
  }
}

async function openEmbeddedCombat(url: string) {
  // If embedded webview exists, just navigate
  if (combatWebview) {
    try {
      await invoke("navigate_combat", { url });
      return;
    } catch {
      combatWebview = null;
    }
  }

  // Clean up any stale webview
  const existing = await Webview.getByLabel("combat");
  if (existing) {
    try { await existing.close(); } catch { /* already gone */ }
    await sleep(200);
  }

  const mainWindow = getCurrentWindow();
  const mainWebview = getCurrentWebview();

  // Save original window width so we can restore it
  const currentSize = await mainWindow.innerSize();
  savedWindowWidth = currentSize.toLogical(await mainWindow.scaleFactor()).width;

  // Expand window and shrink main webview to make room
  const windowHeight = currentSize.toLogical(await mainWindow.scaleFactor()).height;
  await mainWindow.setSize(new LogicalSize(CONTROLS_WIDTH + COMBAT_WIDTH, windowHeight));
  await mainWebview.setSize(new LogicalSize(CONTROLS_WIDTH, windowHeight));
  await mainWebview.setPosition(new LogicalPosition(0, 0));

  // Create embedded combat webview
  combatWebview = new Webview(mainWindow, "combat", {
    url,
    x: CONTROLS_WIDTH,
    y: 0,
    width: COMBAT_WIDTH,
    height: windowHeight,
  });

  combatWebview.once("tauri://error", (e) => {
    console.error("Combat webview error:", e);
    combatWebview = null;
  });

  combatWebview.once("tauri://destroyed", () => {
    combatWebview = null;
    if (process.inCombat) {
      exitCombat();
    }
  });

  // Listen for window resize to adjust both webviews
  resizeUnlisten = await mainWindow.onResized(async ({ payload: size }) => {
    if (!combatWebview) return;
    const scale = await mainWindow.scaleFactor();
    const logical = size.toLogical(scale);
    await mainWebview.setSize(new LogicalSize(CONTROLS_WIDTH, logical.height));
    await combatWebview.setSize(new LogicalSize(Math.max(logical.width - CONTROLS_WIDTH, 200), logical.height));
    await combatWebview.setPosition(new LogicalPosition(CONTROLS_WIDTH, 0));
  });
}

async function openExternalCombat(url: string) {
  // If window reference exists, try to navigate; if it fails the window is dead
  if (combatWindow) {
    try {
      await invoke("navigate_combat", { url });
      return;
    } catch {
      combatWindow = null;
    }
  }

  // Also check if Tauri still has the window (stale JS reference)
  const existing = await WebviewWindow.getByLabel("combat");
  if (existing) {
    try {
      await existing.close();
    } catch { /* already gone */ }
    await sleep(200);
  }

  // Create combat window from JS
  combatWindow = new WebviewWindow("combat", {
    url,
    title: "Combat",
    width: 500,
    height: 700,
    center: true,
  });

  combatWindow.once("tauri://error", (e) => {
    console.error("Combat window error:", e);
    combatWindow = null;
  });

  combatWindow.once("tauri://destroyed", () => {
    combatWindow = null;
    if (process.inCombat) {
      exitCombat();
    }
  });
}

async function navigateCombat(url: string) {
  if (!hasCombatView()) return;
  await invoke("navigate_combat", { url });
}

async function advanceTarget() {
  const now = Date.now();
  if (!process.inCombat || !wars.currentTarget || attackInProgress || now - lastAttackTime < 150) return;
  attackInProgress = true;
  lastAttackTime = now;

  try {
    const target = wars.currentTarget;

    events.push({
      userId: target.user_id,
      userName: target.name,
      type: "attack",
    });

    const isLastTarget = wars.targetIndex >= wars.targets.length - 1;

    if (singleGuildMode.value && isLastTarget) {
      toast.success("All targets done for this guild");
      exitCombat();
      return;
    }

    // If at the last loaded target, try to fetch more before advancing
    if (!singleGuildMode.value && isLastTarget) {
      const countBefore = wars.targets.length;
      await fetchTargets();
      if (wars.targets.length === countBefore) {
        // No new unique targets — reset dedup and retry after cooldown
        toast.info("Cycled all targets — waiting for rate limit reset to retry…");
        await process.pollRateLimit();
        const waitMs = Math.max(process.apiResetIn, 5) * 1000;
        await new Promise((r) => setTimeout(r, waitMs));

        // Trim target list to visited only — clears dedup so refetched users come through
        wars.targets = wars.targets.slice(0, wars.targetIndex + 1);
        emptyGuilds.clear();

        await fetchTargets();
        if (wars.targets.length === wars.targetIndex + 1) {
          toast.success("No more targets available");
          exitCombat();
          return;
        }
      }
    }

    wars.nextTarget();

    // Navigate to the NEXT target so the user always sees a fresh target
    if (wars.currentTarget) {
      await openCombatWindow(wars.currentTarget.user_id);
    } else if (!singleGuildMode.value) {
      toast.success("No more targets available");
      exitCombat();
      return;
    }

    // Prefetch when running low on buffered targets
    if (!singleGuildMode.value && wars.targets.length - wars.targetIndex < 3) {
      fetchTargets();
    }
  } finally {
    attackInProgress = false;
  }
}

async function goBackTarget() {
  if (!process.inCombat) return;
  wars.previousTarget();
  if (wars.currentTarget) {
    await openCombatWindow(wars.currentTarget.user_id);
  }
}

async function handleSpaceBar() {
  if (!keybindsActive.value) return;
  if (await isOnBlockedPage()) return;
  await advanceTarget();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exitCombat() {
  emptyGuilds.clear();
  await hideOverlay();

  // Stop resize listener
  if (resizeUnlisten) {
    resizeUnlisten();
    resizeUnlisten = null;
  }

  if (combatWebview) {
    try { await combatWebview.close(); } catch { /* already closed */ }
    combatWebview = null;

    // Restore main webview and window size
    try {
      const mainWindow = getCurrentWindow();
      const mainWebview = getCurrentWebview();
      const restoreWidth = savedWindowWidth ?? CONTROLS_WIDTH;
      const currentSize = await mainWindow.innerSize();
      const scale = await mainWindow.scaleFactor();
      const logicalHeight = currentSize.toLogical(scale).height;
      await mainWebview.setSize(new LogicalSize(restoreWidth, logicalHeight));
      await mainWebview.setPosition(new LogicalPosition(0, 0));
      await mainWindow.setSize(new LogicalSize(restoreWidth, logicalHeight));
    } catch { /* best effort */ }
    savedWindowWidth = null;
  }

  if (combatWindow) {
    try { await combatWindow.close(); } catch { /* already closed */ }
    combatWindow = null;
  }

  await invoke("unregister_shortcuts");
  keybindsActive.value = false;
  process.setInCombat(false);
  wars.reset();
  wars.init();
  events.clear();
}
</script>

<template>
  <div class="space-y-3">
    <Card class="border-border/60 bg-card">
      <CardHeader class="px-4 py-3">
        <CardTitle class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Swords class="h-3.5 w-3.5 text-primary" />
          Combat Setup
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 px-4 pb-4">
        <div class="flex items-end gap-2">
          <div class="flex-1">
            <label class="mb-1 block text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Min Level</label>
            <Input
              v-model.number="minLevel"
              type="number"
              placeholder="0"
              class="h-8 bg-secondary/50 border-border/60 text-sm font-mono"
            />
          </div>
          <div class="flex-1">
            <label class="mb-1 block text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Max Level</label>
            <Input
              v-model.number="maxLevel"
              type="number"
              placeholder="Max"
              class="h-8 bg-secondary/50 border-border/60 text-sm font-mono"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            :disabled="!maxLevel"
            class="h-8 border-border/60 text-xs hover:bg-secondary transition-colors"
            @click="saveLevels"
          >
            <Save class="mr-1.5 h-3 w-3" /> Save
          </Button>
        </div>

        <Separator class="bg-border/40" />

        <div class="flex items-center justify-between">
          <button
            class="flex items-center gap-2 rounded px-1 -mx-1 transition-colors"
            :class="process.inCombat ? 'hover:bg-secondary/50 cursor-pointer' : 'cursor-default'"
            :title="process.inCombat ? (keybindsActive ? 'Click to disable keybinds' : 'Click to enable keybinds') : ''"
            @click="toggleKeybinds"
          >
            <div
              class="h-2 w-2 rounded-full transition-colors"
              :class="keybindsActive ? 'bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.4)]' : 'bg-red-400/60'"
            />
            <Keyboard class="h-3.5 w-3.5 text-muted-foreground" />
            <span class="text-xs font-medium">Keybinds</span>
            <span class="text-[10px] font-mono" :class="keybindsActive ? 'text-emerald-400' : 'text-red-400/60'">
              {{ keybindsActive ? "ACTIVE" : "OFF" }}
            </span>
          </button>

          <div class="flex gap-1.5">
            <Button
              v-if="process.inCombat"
              variant="outline"
              size="sm"
              class="h-7 text-xs border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              @click="exitCombat"
            >
              <LogOut class="mr-1.5 h-3 w-3" />
              Exit
            </Button>
            <Button
              size="sm"
              :disabled="!maxLevel || !settings.apiKey || wars.warlist.length === 0 || process.inCombat || initiatingCombat"
              class="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 glow-purple transition-all disabled:opacity-40"
              @click="enterCombat"
            >
              <Loader2 v-if="initiatingCombat" class="mr-1.5 h-3 w-3 animate-spin" />
              <Swords v-else class="mr-1.5 h-3 w-3" />
              {{ initiatingCombat ? "Loading..." : "Enter Combat" }}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <EventLog v-if="process.inCombat" class="animate-slide-up" />

    <div v-if="process.inCombat" class="flex gap-1.5 animate-slide-up">
      <Button
        variant="outline"
        size="sm"
        class="h-7 flex-1 text-xs border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        @click="navigateCombat('https://web.simple-mmo.com/inventory/items?itemname=&minlevel=&maxlevel=&type%5B%5D=Food')"
      >
        <UtensilsCrossed class="mr-1.5 h-3 w-3" />
        Food
      </Button>
      <Button
        variant="outline"
        size="sm"
        class="h-7 flex-1 text-xs border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        @click="navigateCombat('https://web.simple-mmo.com/healer')"
      >
        <HeartPulse class="mr-1.5 h-3 w-3" />
        Healer
      </Button>
      <Button
        variant="outline"
        size="sm"
        class="h-7 flex-1 text-xs border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        @click="navigateCombat('https://web.simple-mmo.com/diamondstore/rewards/energy-points')"
      >
        <Zap class="mr-1.5 h-3 w-3" />
        Energy
      </Button>
    </div>
    <WarlistTable v-else class="animate-in" @target-guild="enterCombatForGuild" />
  </div>
</template>
