<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Swords, Save, Keyboard, LogOut, Loader2 } from "lucide-vue-next";
import { toast } from "vue-sonner";
import WarlistTable from "./WarlistTable.vue";
import EventLog from "./EventLog.vue";

import { useUserStore } from "@/stores/user";
import { useSettingsStore } from "@/stores/settings";
import { useWarsStore, type War } from "@/stores/wars";
import { useProcessStore } from "@/stores/process";
import { useEventsStore } from "@/stores/events";

const user = useUserStore();
const settings = useSettingsStore();
const wars = useWarsStore();
const process = useProcessStore();
const events = useEventsStore();

const minLevel = ref(settings.minLevel ?? 0);
const maxLevel = ref(settings.maxLevel ?? 0);
const initiatingCombat = ref(false);
const singleGuildMode = ref(false);
let combatWindow: WebviewWindow | null = null;
let attackInProgress = false;

const unlisteners: UnlistenFn[] = [];

onMounted(async () => {
  minLevel.value = settings.minLevel ?? 0;
  maxLevel.value = settings.maxLevel ?? 0;

  unlisteners.push(
    await listen("Space", handleSpaceBar),
    await listen("Control+Space", handleCtrlSpace),
  );

  const interval = setInterval(() => process.checkApiReset(), 100);
  unlisteners.push(() => clearInterval(interval));
});

onUnmounted(() => {
  unlisteners.forEach((fn) => fn());
});

watch(() => settings.minLevel, (val) => {
  minLevel.value = val ?? 0;
});
watch(() => settings.maxLevel, (val) => {
  maxLevel.value = val ?? 0;
});

async function saveLevels() {
  await settings.saveMinLevel(minLevel.value);
  await settings.saveMaxLevel(maxLevel.value);
  toast.success("Level filters saved");
}

async function enterCombat() {
  if (!settings.apiKey || wars.warlist.length === 0) return;
  initiatingCombat.value = true;
  singleGuildMode.value = false;

  try {
    await fetchTargets();
    process.setInCombat(true);
    events.clear();
    if (wars.currentTarget) {
      await openCombatWindow(wars.currentTarget.user_id);
    }
    await invoke("register_shortcuts");
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
    process.checkApiReset();
    if (process.apiLimitReached) {
      toast.warning("API limit reached. Try again later.");
      return;
    }

    process.trackApiCall();
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
  } catch (e) {
    toast.error("Failed to load targets");
  } finally {
    initiatingCombat.value = false;
  }
}

async function fetchTargets() {
  while (!wars.currentTarget) {
    process.checkApiReset();
    if (process.apiLimitReached) {
      const resetIn = process.resetInSeconds;
      toast.warning(`API limit reached. Retrying in ${resetIn}s`);
      await sleep(resetIn * 1000);
      continue;
    }

    // Collect up to 3 unique guilds to fetch in parallel
    const batch = new Set<number>();
    const maxBatch = Math.min(3, wars.warlist.length);
    for (let i = 0; i < maxBatch; i++) {
      const war = wars.currentWar;
      if (!war) break;
      const guildId =
        war.attacker_id === user.guildId ? war.defender_id : war.attacker_id;
      batch.add(guildId);
      wars.nextGuild();
    }

    if (batch.size === 0) break;

    // Fire all requests in parallel
    const guildIds = [...batch];
    const results = await Promise.allSettled(
      guildIds.map((guildId) => {
        process.trackApiCall();
        return wars.fetchTargets(guildId, settings.apiKey!, settings.minLevel, settings.maxLevel);
      })
    );

    // If all failed, break to avoid infinite loop
    if (results.every((r) => r.status === "rejected")) break;
  }
}

async function openCombatWindow(userId: number) {
  const url = `https://web.simple-mmo.com/user/attack/${userId}`;

  // If window already exists, navigate via Rust eval
  if (combatWindow) {
    await invoke("navigate_combat", { url });
    return;
  }

  // Create new combat window via JS API (per Tauri v2 docs)
  combatWindow = new WebviewWindow("combat", {
    url,
    title: "Combat",
    width: 500,
    height: 750,
    minWidth: 500,
    minHeight: 750,
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

async function handleSpaceBar() {
  if (!process.inCombat || !wars.currentTarget || attackInProgress) return;
  attackInProgress = true;

  try {
    const target = wars.currentTarget;

    await openCombatWindow(target.user_id);
    await invoke("update_target_hit", { userId: target.user_id, hit: 1 });
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

    wars.nextTarget();

    if (!singleGuildMode.value && wars.targets.length - wars.targetIndex < 5) {
      fetchTargets();
    }
  } finally {
    attackInProgress = false;
  }
}

function handleCtrlSpace() {
  if (!process.inCombat) return;
  wars.previousTarget();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exitCombat() {
  if (combatWindow) {
    try { await combatWindow.close(); } catch { /* already closed */ }
    combatWindow = null;
  }
  await invoke("unregister_shortcuts");
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
          <div class="flex items-center gap-2">
            <div
              class="h-2 w-2 rounded-full transition-colors"
              :class="process.inCombat ? 'bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.4)]' : 'bg-red-400/60'"
            />
            <Keyboard class="h-3.5 w-3.5 text-muted-foreground" />
            <span class="text-xs font-medium">Keybinds</span>
            <span class="text-[10px] font-mono" :class="process.inCombat ? 'text-emerald-400' : 'text-red-400/60'">
              {{ process.inCombat ? "ACTIVE" : "OFF" }}
            </span>
          </div>

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
    <WarlistTable v-else class="animate-in" @target-guild="enterCombatForGuild" />
  </div>
</template>
