<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, Clock } from "lucide-vue-next";

interface PlayerCooldown {
  user_id: number;
  kill_count: number;
  cooldown_type: string;
  expires_at: number;
  kill_timestamps: number[];
}

const cooldowns = ref<PlayerCooldown[]>([]);
const now = ref(Math.floor(Date.now() / 1000));
let pollInterval: ReturnType<typeof setInterval> | null = null;
let tickInterval: ReturnType<typeof setInterval> | null = null;

async function loadCooldowns() {
  try {
    cooldowns.value = await invoke<PlayerCooldown[]>("fetch_cooldowns");
  } catch {
    cooldowns.value = [];
  }
}

function formatCountdown(expiresAt: number): string {
  const remaining = expiresAt - now.value;
  if (remaining <= 0) return "Expired";
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

const activeCooldowns = computed(() =>
  cooldowns.value.filter((c) => c.expires_at > now.value)
);

onMounted(() => {
  loadCooldowns();
  // Refresh data every 10 seconds
  pollInterval = setInterval(loadCooldowns, 10000);
  // Tick countdown every second
  tickInterval = setInterval(() => {
    now.value = Math.floor(Date.now() / 1000);
  }, 1000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
  if (tickInterval) clearInterval(tickInterval);
});
</script>

<template>
  <Card class="border-border/60 bg-card">
    <CardHeader class="px-4 py-3">
      <div class="flex items-center gap-2">
        <CardTitle
          class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          <Timer class="h-3.5 w-3.5 text-primary" />
          Kill Cooldowns
        </CardTitle>
        <Badge
          v-if="activeCooldowns.length > 0"
          class="h-4 rounded px-1.5 text-[10px] font-mono bg-primary/10 text-primary border-0"
        >
          {{ activeCooldowns.length }}
        </Badge>
      </div>
    </CardHeader>
    <CardContent class="px-4 pb-4">
      <div class="max-h-[60vh] overflow-y-auto">
        <table v-if="activeCooldowns.length > 0" class="w-full text-sm">
          <thead>
            <tr class="border-b border-border/40">
              <th
                class="pb-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Player ID
              </th>
              <th
                class="pb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Type
              </th>
              <th
                class="pb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Kills
              </th>
              <th
                class="pb-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Available In
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cd in activeCooldowns"
              :key="cd.user_id"
              class="group border-b border-border/20 transition-colors hover:bg-secondary/30"
            >
              <td class="py-2 font-mono text-xs font-medium">
                {{ cd.user_id }}
              </td>
              <td class="py-2 text-center">
                <Badge
                  :class="
                    cd.cooldown_type === '3x'
                      ? 'bg-yellow-500/10 text-yellow-400 border-0'
                      : 'bg-red-500/10 text-red-400 border-0'
                  "
                  class="text-[10px] font-mono px-1.5 py-0 rounded"
                >
                  {{ cd.cooldown_type }}
                </Badge>
              </td>
              <td class="py-2 text-center">
                <div class="flex items-center justify-center gap-1">
                  <span class="font-mono text-xs text-muted-foreground">
                    {{ cd.kill_count }}/{{ cd.cooldown_type === "3x" ? "3" : "4" }}
                  </span>
                </div>
              </td>
              <td class="py-2 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <Clock class="h-3 w-3 text-muted-foreground/60" />
                  <span class="font-mono text-xs text-foreground">
                    {{ formatCountdown(cd.expires_at) }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Kill timeline on hover -->
        <div v-if="activeCooldowns.length > 0" class="mt-3 space-y-2">
          <details
            v-for="cd in activeCooldowns"
            :key="'detail-' + cd.user_id"
            class="group"
          >
            <summary
              class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary/30 transition-colors"
            >
              <span class="font-mono">{{ cd.user_id }}</span>
              <span class="text-muted-foreground/60">kill timeline</span>
            </summary>
            <div class="ml-4 mt-1 space-y-0.5">
              <div
                v-for="(ts, i) in cd.kill_timestamps"
                :key="i"
                class="flex items-center gap-2 text-[11px] text-muted-foreground/80"
              >
                <div class="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <span class="font-mono">Kill {{ i + 1 }}</span>
                <span class="text-muted-foreground/50">
                  {{ formatDate(ts) }} {{ formatTime(ts) }}
                </span>
              </div>
            </div>
          </details>
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center py-12 text-muted-foreground"
        >
          <Timer class="mb-2 h-6 w-6 opacity-20" />
          <p class="text-xs">No active cooldowns</p>
          <p class="mt-1 text-[10px] text-muted-foreground/60">
            Players you've killed will appear here with their cooldown timers
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
