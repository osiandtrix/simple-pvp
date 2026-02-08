<script setup lang="ts">
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Shuffle, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-vue-next";
import { useWarsStore, type War } from "@/stores/wars";
import { useUserStore } from "@/stores/user";
import { useSettingsStore } from "@/stores/settings";
import { toast } from "vue-sonner";

const wars = useWarsStore();
const user = useUserStore();
const settings = useSettingsStore();

type SortKey = "name" | "you" | "them";
type SortDir = "asc" | "desc";

const sortKey = ref<SortKey>("name");
const sortDir = ref<SortDir>("asc");

function getOpponent(war: War) {
  if (war.attacker_id === user.guildId) {
    return { name: war.defender, you: war.attacker_kills, them: war.defender_kills };
  }
  return { name: war.attacker, you: war.defender_kills, them: war.attacker_kills };
}

const sortedWars = computed(() => {
  const mapped = wars.warlist.map((war) => ({
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
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <CardTitle class="text-sm font-medium">Active Wars</CardTitle>
          <Badge v-if="wars.warlist.length > 0" variant="secondary" class="text-[10px] px-1.5 py-0">
            {{ wars.warlist.length }}
          </Badge>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="shuffleWars" :disabled="wars.warlist.length === 0">
            <Shuffle class="mr-2 h-3 w-3" /> Shuffle
          </Button>
          <Button variant="outline" size="sm" @click="updateWars">
            <RefreshCw class="mr-2 h-3 w-3" /> Update
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <ScrollArea class="h-[40vh]">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-muted-foreground">
              <th
                class="pb-2 text-left font-medium cursor-pointer select-none hover:text-foreground transition-colors"
                @click="toggleSort('name')"
              >
                <span class="inline-flex items-center gap-1">
                  Guild
                  <ArrowUp v-if="sortKey === 'name' && sortDir === 'asc'" class="h-3 w-3" />
                  <ArrowDown v-else-if="sortKey === 'name' && sortDir === 'desc'" class="h-3 w-3" />
                  <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
                </span>
              </th>
              <th
                class="pb-2 text-right font-medium cursor-pointer select-none hover:text-foreground transition-colors"
                @click="toggleSort('you')"
              >
                <span class="inline-flex items-center justify-end gap-1">
                  You
                  <ArrowUp v-if="sortKey === 'you' && sortDir === 'asc'" class="h-3 w-3" />
                  <ArrowDown v-else-if="sortKey === 'you' && sortDir === 'desc'" class="h-3 w-3" />
                  <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
                </span>
              </th>
              <th
                class="pb-2 text-right font-medium cursor-pointer select-none hover:text-foreground transition-colors"
                @click="toggleSort('them')"
              >
                <span class="inline-flex items-center justify-end gap-1">
                  Them
                  <ArrowUp v-if="sortKey === 'them' && sortDir === 'asc'" class="h-3 w-3" />
                  <ArrowDown v-else-if="sortKey === 'them' && sortDir === 'desc'" class="h-3 w-3" />
                  <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in sortedWars"
              :key="i"
              class="border-b border-border/50 hover:bg-muted/50 transition-colors"
            >
              <td class="py-2 font-medium">{{ row.name }}</td>
              <td class="py-2 text-right tabular-nums text-green-400">
                {{ row.you }}
              </td>
              <td class="py-2 text-right tabular-nums text-red-400">
                {{ row.them }}
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="wars.warlist.length === 0" class="py-8 text-center text-muted-foreground">
          No active wars. Set your API key and update.
        </p>
      </ScrollArea>
    </CardContent>
  </Card>
</template>
