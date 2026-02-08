<script setup lang="ts">
import { Menu } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

defineEmits<{
  toggleSidebar: [];
}>();
</script>

<template>
  <header class="flex h-12 items-center border-b px-4">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="icon" @click="$emit('toggleSidebar')">
        <Menu class="h-5 w-5" />
      </Button>
      <h1 class="text-lg font-semibold">Simple Companion PvP</h1>
    </div>
  </header>
</template>
