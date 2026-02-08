<script setup lang="ts">
import { computed } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Swords, Eye, EyeOff, Zap, Radio } from "lucide-vue-next";
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

const colorMap: Record<string, string> = {
  attack: "text-primary",
  hit: "text-emerald-400",
  nothit: "text-red-400",
};

const bgMap: Record<string, string> = {
  attack: "bg-primary/5",
  hit: "bg-emerald-400/5",
  nothit: "bg-red-400/5",
};
</script>

<template>
  <Card class="border-border/60 bg-card">
    <CardHeader class="px-4 py-3">
      <div class="flex items-center justify-between">
        <CardTitle class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Radio class="h-3.5 w-3.5 text-emerald-400" />
          Combat Log
        </CardTitle>
        <div class="flex gap-1.5">
          <Badge variant="secondary" class="h-5 rounded px-1.5 text-[10px] font-mono bg-primary/10 border-0">
            <span class="text-primary mr-1">Targets</span>
            <span class="text-foreground">{{ wars.targetIndex + 1 }}/{{ wars.targets.length }}</span>
          </Badge>
          <Badge variant="secondary" class="h-5 rounded px-1.5 text-[10px] font-mono bg-emerald-500/10 border-0">
            <span class="text-emerald-400 mr-1">Guilds</span>
            <span class="text-foreground">{{ wars.activeGuildIndex + 1 }}/{{ wars.warlist.length }}</span>
          </Badge>
          <Badge
            variant="secondary"
            class="h-5 rounded px-1.5 text-[10px] font-mono border-0"
            :class="process.apiLimitReached ? 'bg-red-500/10' : 'bg-amber-500/10'"
          >
            <Zap class="mr-1 h-2.5 w-2.5" :class="process.apiLimitReached ? 'text-red-400' : 'text-amber-400'" />
            <span :class="process.apiLimitReached ? 'text-red-400' : 'text-amber-400'">{{ process.apiRemaining }}/40</span>
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent class="px-4 pb-4">
      <ScrollArea class="h-[50vh]">
        <div class="space-y-0.5">
          <div
            v-for="(event, i) in recentEvents"
            :key="i"
            class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors animate-fade-in"
            :class="bgMap[event.type]"
          >
            <component
              :is="iconMap[event.type]"
              class="h-3.5 w-3.5 shrink-0"
              :class="colorMap[event.type]"
            />
            <span class="truncate text-xs">{{ event.text }}</span>
          </div>
          <div v-if="events.events.length === 0" class="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Swords class="mb-2 h-6 w-6 opacity-20" />
            <p class="text-xs">Waiting for combat actions...</p>
          </div>
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
</template>
