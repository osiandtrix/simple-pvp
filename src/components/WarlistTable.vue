<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shuffle, RefreshCw } from "lucide-vue-next";
import { useWarsStore } from "@/stores/wars";
import { useUserStore } from "@/stores/user";
import { useSettingsStore } from "@/stores/settings";
import { toast } from "vue-sonner";

const wars = useWarsStore();
const user = useUserStore();
const settings = useSettingsStore();

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

function getOpponent(war: any) {
  if (war.attacker_id === user.guildId) {
    return { name: war.defender, you: war.attacker_kills, them: war.defender_kills };
  }
  return { name: war.attacker, you: war.defender_kills, them: war.attacker_kills };
}
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <CardTitle class="text-sm font-medium">Active Wars</CardTitle>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="shuffleWars">
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
              <th class="pb-2 text-left font-medium">Guild</th>
              <th class="pb-2 text-right font-medium">You</th>
              <th class="pb-2 text-right font-medium">Them</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(war, i) in wars.warlist"
              :key="i"
              class="border-b border-border/50 hover:bg-muted/50"
            >
              <td class="py-2">{{ getOpponent(war).name }}</td>
              <td class="py-2 text-right text-green-400">
                {{ getOpponent(war).you }}
              </td>
              <td class="py-2 text-right text-red-400">
                {{ getOpponent(war).them }}
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
