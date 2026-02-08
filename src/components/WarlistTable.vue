<script setup lang="ts">
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shuffle, RefreshCw, ArrowUp, ArrowDown, ArrowUpDown, Shield, Crosshair, Ban } from "lucide-vue-next";
import { useWarsStore, type War } from "@/stores/wars";
import { useUserStore } from "@/stores/user";
import { useSettingsStore } from "@/stores/settings";
import { useBlocklistStore } from "@/stores/blocklist";
import { toast } from "vue-sonner";

const wars = useWarsStore();
const user = useUserStore();
const settings = useSettingsStore();
const blocklist = useBlocklistStore();

const emit = defineEmits<{
  targetGuild: [war: War];
}>();

type SortKey = "name" | "you" | "them";
type SortDir = "asc" | "desc";

const sortKey = ref<SortKey>("you");
const sortDir = ref<SortDir>("desc");

function getOpponent(war: War) {
  if (war.attacker_id === user.guildId) {
    return { name: war.defender, you: war.attacker_kills, them: war.defender_kills };
  }
  return { name: war.attacker, you: war.defender_kills, them: war.attacker_kills };
}

const sortedWars = computed(() => {
  const mapped = wars.warlist
    .filter((war) => {
      const opponentId = war.attacker_id === user.guildId ? war.defender_id : war.attacker_id;
      return !blocklist.isBlocked(opponentId);
    })
    .map((war) => ({
      war,
      ...getOpponent(war),
    }));

  mapped.sort((a, b) => {
    let cmp = 0;
    switch (sortKey.value) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "you":
        cmp = a.you - b.you;
        break;
      case "them":
        cmp = a.them - b.them;
        break;
    }
    return sortDir.value === "asc" ? cmp : -cmp;
  });

  return mapped;
});

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = key === "name" ? "asc" : "desc";
  }
}

async function updateWars() {
  if (!user.guildId || !settings.apiKey) {
    toast.error("API key and guild ID required");
    return;
  }
  try {
    await wars.updateWars(user.guildId, settings.apiKey);
    toast.success("Wars updated");
  } catch (e) {
    toast.error("Failed to update wars");
  }
}

function shuffleWars() {
  wars.shuffleWars();
}

async function handleBlock(war: War) {
  const opponentId = war.attacker_id === user.guildId ? war.defender_id : war.attacker_id;
  const opponentName = war.attacker_id === user.guildId ? war.defender : war.attacker;
  await blocklist.blockGuild(opponentId, opponentName);
  toast.success(`Blocked ${opponentName}`);
}
</script>

<template>
  <Card class="border-border/60 bg-card">
    <CardHeader class="px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <CardTitle class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Shield class="h-3.5 w-3.5 text-primary" />
            Active Wars
          </CardTitle>
          <Badge
            v-if="sortedWars.length > 0"
            class="h-4 rounded px-1.5 text-[10px] font-mono bg-primary/10 text-primary border-0"
          >
            {{ sortedWars.length }}
          </Badge>
        </div>
        <div class="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            class="h-7 text-xs border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            :disabled="wars.warlist.length === 0"
            @click="shuffleWars"
          >
            <Shuffle class="mr-1.5 h-3 w-3" /> Shuffle
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="h-7 text-xs border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            @click="updateWars"
          >
            <RefreshCw class="mr-1.5 h-3 w-3" /> Update
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent class="px-4 pb-4">
      <div class="max-h-[50vh] overflow-y-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border/40">
              <th
                class="pb-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                @click="toggleSort('name')"
              >
                <span class="inline-flex items-center gap-1">
                  Guild
                  <ArrowUp v-if="sortKey === 'name' && sortDir === 'asc'" class="h-3 w-3 text-primary" />
                  <ArrowDown v-else-if="sortKey === 'name' && sortDir === 'desc'" class="h-3 w-3 text-primary" />
                  <ArrowUpDown v-else class="h-3 w-3 opacity-20" />
                </span>
              </th>
              <th
                class="pb-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                @click="toggleSort('you')"
              >
                <span class="inline-flex items-center justify-end gap-1">
                  You
                  <ArrowUp v-if="sortKey === 'you' && sortDir === 'asc'" class="h-3 w-3 text-primary" />
                  <ArrowDown v-else-if="sortKey === 'you' && sortDir === 'desc'" class="h-3 w-3 text-primary" />
                  <ArrowUpDown v-else class="h-3 w-3 opacity-20" />
                </span>
              </th>
              <th
                class="pb-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                @click="toggleSort('them')"
              >
                <span class="inline-flex items-center justify-end gap-1">
                  Them
                  <ArrowUp v-if="sortKey === 'them' && sortDir === 'asc'" class="h-3 w-3 text-primary" />
                  <ArrowDown v-else-if="sortKey === 'them' && sortDir === 'desc'" class="h-3 w-3 text-primary" />
                  <ArrowUpDown v-else class="h-3 w-3 opacity-20" />
                </span>
              </th>
              <th class="pb-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in sortedWars"
              :key="i"
              class="group border-b border-border/20 transition-colors hover:bg-secondary/30"
            >
              <td class="py-1.5 text-xs font-medium">{{ row.name }}</td>
              <td class="py-1.5 text-right font-mono text-xs text-emerald-400">
                {{ row.you }}
              </td>
              <td class="py-1.5 text-right font-mono text-xs text-red-400">
                {{ row.them }}
              </td>
              <td class="py-1.5 text-right">
                <div class="inline-flex gap-0.5">
                  <button
                    class="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:bg-primary/10 hover:text-primary"
                    title="Target this guild only"
                    @click="emit('targetGuild', row.war)"
                  >
                    <Crosshair class="h-3 w-3" />
                  </button>
                  <button
                    class="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                    title="Block this guild"
                    @click="handleBlock(row.war)"
                  >
                    <Ban class="h-3 w-3" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="sortedWars.length === 0" class="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Shield class="mb-2 h-6 w-6 opacity-20" />
          <p class="text-xs">No active wars</p>
          <p class="mt-1 text-[10px] text-muted-foreground/60">Set your API key and update</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
