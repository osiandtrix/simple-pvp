<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Swords, Save } from "lucide-vue-next";
import { toast } from "vue-sonner";
import WarlistTable from "./WarlistTable.vue";
import EventLog from "./EventLog.vue";

import { useUserStore } from "@/stores/user";
import { useSettingsStore } from "@/stores/settings";
import { useWarsStore } from "@/stores/wars";
import { useProcessStore } from "@/stores/process";
import { useEventsStore } from "@/stores/events";

const user = useUserStore();
const settings = useSettingsStore();
const wars = useWarsStore();
const process = useProcessStore();
const events = useEventsStore();

const maxLevel = ref(settings.maxLevel ?? 0);
const keybindsActive = ref(true);
const initiatingCombat = ref(false);

const unlisteners: UnlistenFn[] = [];

onMounted(async () => {
  maxLevel.value = settings.maxLevel ?? 0;

  unlisteners.push(
    await listen("Space", handleSpaceBar),
    await listen("Control+Space", handleCtrlSpace),
    await listen("Control+ArrowLeft", handleCtrlArrowLeft),
    await listen("Shift+ArrowLeft", handleShiftArrowLeft),
    await listen("Shift+ArrowDown", handleShiftArrowDown),
    await listen("Control+ArrowDown", handleCtrlArrowDown),
  );

  const interval = setInterval(() => process.checkApiReset(), 100);
  unlisteners.push(() => clearInterval(interval));
});

onUnmounted(() => {
  unlisteners.forEach((fn) => fn());
});

watch(() => settings.maxLevel, (val) => {
  maxLevel.value = val ?? 0;
});

async function saveMaxLevel() {
  await settings.saveMaxLevel(maxLevel.value);
  toast.success("Max level saved");
}

async function enterCombat() {
  if (!settings.apiKey || wars.warlist.length === 0) return;
  initiatingCombat.value = true;

  try {
    await fetchTargets();
    process.setInCombat(true);
    events.clear();
  } catch (e) {
    toast.error("Failed to enter combat");
  } finally {
    initiatingCombat.value = false;
  }
}

async function fetchTargets() {
  const initialCount = wars.targets.length === 0 ? -1 : wars.targets.length;

  while (wars.targets.length <= initialCount || !wars.currentTarget) {
    process.checkApiReset();
    if (process.apiLimitReached) {
      const resetIn = process.resetInSeconds;
      toast.warning(`API limit reached. Retrying in ${resetIn}s`);
      await sleep(resetIn * 1000);
    }

    const currentWar = wars.currentWar;
    if (!currentWar) break;

    const guildId =
      currentWar.attacker_id === user.guildId
        ? currentWar.defender_id
        : currentWar.attacker_id;

    try {
      process.trackApiCall();
      await wars.fetchTargets(guildId, settings.apiKey!, settings.maxLevel);
      wars.nextGuild();
    } catch {
      process.trackApiCall();
    }
  }
}

async function handleSpaceBar() {
  if (!process.inCombat || !wars.currentTarget) return;
  const target = wars.currentTarget;

  await invoke("update_target_hit", { user_id: target.user_id, hit: 1 });
  events.push({
    userId: target.user_id,
    userName: target.name,
    type: "attack",
  });

  wars.nextTarget();

  if (wars.targets.length - wars.targetIndex < 5) {
    fetchTargets();
  }
}

function handleCtrlSpace() {
  if (!process.inCombat) return;
  wars.previousTarget();
}

async function handleShiftArrowLeft() {
  if (!process.inCombat || wars.targetIndex === 0) return;
  const prev = wars.targets[wars.targetIndex - 1];
  if (!prev) return;
  await invoke("update_target_hit", { user_id: prev.user_id, hit: 1 });
  events.push({ userId: prev.user_id, userName: prev.name, type: "hit" });
}

async function handleCtrlArrowLeft() {
  if (!process.inCombat || wars.targetIndex === 0) return;
  const prev = wars.targets[wars.targetIndex - 1];
  if (!prev) return;
  await invoke("update_target_hit", { user_id: prev.user_id, hit: -1 });
  events.push({ userId: prev.user_id, userName: prev.name, type: "nothit" });
}

async function handleShiftArrowDown() {
  if (!process.inCombat || !wars.currentTarget) return;
  const target = wars.currentTarget;
  await invoke("update_target_hit", { user_id: target.user_id, hit: 1 });
  events.push({ userId: target.user_id, userName: target.name, type: "hit" });
}

async function handleCtrlArrowDown() {
  if (!process.inCombat || !wars.currentTarget) return;
  const target = wars.currentTarget;
  await invoke("update_target_hit", { user_id: target.user_id, hit: -1 });
  events.push({ userId: target.user_id, userName: target.name, type: "nothit" });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function exitCombat() {
  process.setInCombat(false);
  wars.reset();
  wars.init();
  events.clear();
}
</script>

<template>
  <div class="space-y-4">
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-sm font-medium">Combat Setup</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-end gap-3">
          <div class="flex-1">
            <label class="mb-1 block text-xs text-muted-foreground">Max Level</label>
            <Input v-model.number="maxLevel" type="number" placeholder="Max target level" />
          </div>
          <Button variant="outline" size="sm" :disabled="!maxLevel" @click="saveMaxLevel">
            <Save class="mr-2 h-3 w-3" /> Save
          </Button>
        </div>

        <Separator />

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Switch
              v-model:checked="keybindsActive"
              :disabled="!process.inCombat"
            />
            <span class="text-sm">Keybinds</span>
          </div>

          <div class="flex gap-2">
            <Button
              v-if="process.inCombat"
              variant="outline"
              size="sm"
              @click="exitCombat"
            >
              Exit Combat
            </Button>
            <Button
              variant="destructive"
              size="sm"
              :disabled="!maxLevel || !settings.apiKey || wars.warlist.length === 0 || process.inCombat || initiatingCombat"
              @click="enterCombat"
            >
              <Swords class="mr-2 h-3 w-3" />
              {{ initiatingCombat ? "Loading..." : "Enter Combat" }}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <EventLog v-if="process.inCombat" />
    <WarlistTable v-else />
  </div>
</template>
