<script setup lang="ts">
import { Swords, Settings, FileText } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
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
  { id: "main", label: "Combat", icon: Swords },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "changelog", label: "Changelog", icon: FileText },
];

function navigateTo(page: string) {
  if (process.inCombat && page !== "main") return;
  emit("navigate", page);
  emit("update:open", false);
}
</script>

<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent side="left" class="w-64 p-0">
      <nav class="flex flex-col gap-1 p-4 pt-12">
        <Button
          v-for="item in navItems"
          :key="item.id"
          :variant="activePage === item.id ? 'secondary' : 'ghost'"
          class="justify-start gap-3"
          :disabled="process.inCombat && item.id !== 'main'"
          @click="navigateTo(item.id)"
        >
          <component :is="item.icon" class="h-4 w-4" />
          {{ item.label }}
        </Button>
      </nav>
    </SheetContent>
  </Sheet>
</template>
