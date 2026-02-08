<script setup lang="ts">
import { Swords, Settings, FileText, Ban } from "lucide-vue-next";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useProcessStore } from "@/stores/process";

const process = useProcessStore();

defineProps<{
  open: boolean;
  activePage: string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  navigate: [page: string];
}>();

const navItems = [
  { id: "main", label: "Combat", icon: Swords, description: "Battle management" },
  { id: "settings", label: "Settings", icon: Settings, description: "API & preferences" },
  { id: "blocked", label: "Blocked", icon: Ban, description: "Blocked guilds" },
  { id: "changelog", label: "Changelog", icon: FileText, description: "Version history" },
];

function navigateTo(page: string) {
  if (process.inCombat && page !== "main") return;
  emit("navigate", page);
  emit("update:open", false);
}
</script>

<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent side="left" class="w-60 border-r border-border/60 bg-card p-0">
      <div class="flex h-11 items-center border-b border-border/60 px-3">
        <span class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Navigation</span>
      </div>

      <nav class="flex flex-col gap-0.5 p-2">
        <button
          v-for="item in navItems"
          :key="item.id"
          :disabled="process.inCombat && item.id !== 'main'"
          class="group flex items-center gap-3 rounded-md px-2.5 py-2 text-left transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          :class="[
            activePage === item.id
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
          ]"
          @click="navigateTo(item.id)"
        >
          <div
            class="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            :class="[
              activePage === item.id
                ? 'bg-primary/10 text-primary'
                : 'bg-transparent text-muted-foreground group-hover:text-foreground',
            ]"
          >
            <component :is="item.icon" class="h-3.5 w-3.5" />
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium leading-none">{{ item.label }}</span>
            <span class="mt-0.5 text-[10px] text-muted-foreground leading-none">{{ item.description }}</span>
          </div>
          <div
            v-if="activePage === item.id"
            class="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
          />
        </button>
      </nav>

      <div class="absolute bottom-0 left-0 right-0 border-t border-border/40 p-3">
        <p class="text-[10px] font-mono text-muted-foreground/40 text-center tracking-wider">
          SIMPLE PVP COMPANION
        </p>
      </div>
    </SheetContent>
  </Sheet>
</template>
