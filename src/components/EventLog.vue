<script setup lang="ts">
import { computed } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Swords, Eye, EyeOff, Activity } from "lucide-vue-next";
import { useEventsStore } from "@/stores/events";
import { useWarsStore } from "@/stores/wars";
import { useProcessStore } from "@/stores/process";

const events = useEventsStore();
const wars = useWarsStore();
const process = useProcessStore();

const recentEvents = computed(() =>
  [...events.events].reverse().slice(0, 15)
);

const iconMap = {
  attack: Swords,
  hit: Eye,
  nothit: EyeOff,
};

const colorMap = {
  attack: "text-blue-400",
  hit: "text-green-400",
  nothit: "text-red-400",
};
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <CardTitle class="text-sm font-medium">Combat Log</CardTitle>
        <div class="flex gap-2">
          <Badge variant="secondary">
            Target {{ wars.targetIndex + 1 }}/{{ wars.targets.length }}
          </Badge>
          <Badge variant="secondary">
            Guild {{ wars.activeGuildIndex + 1 }}/{{ wars.warlist.length }}
          </Badge>
          <Badge variant="secondary" :class="process.apiLimitReached ? 'text-red-400' : ''">
            <Activity class="mr-1 h-3 w-3" />
            {{ process.apiRemaining }}/40
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <ScrollArea class="h-[50vh]">
        <div class="space-y-1">
          <div
            v-for="(event, i) in recentEvents"
            :key="i"
            class="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted/50"
          >
            <component
              :is="iconMap[event.type]"
              class="h-4 w-4 shrink-0"
              :class="colorMap[event.type]"
            />
            <span class="truncate">{{ event.text }}</span>
          </div>
          <p v-if="events.events.length === 0" class="py-4 text-center text-muted-foreground">
            Waiting for combat actions...
          </p>
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
</template>
