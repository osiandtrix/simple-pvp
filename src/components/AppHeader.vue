<script setup lang="ts">
import { Menu } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

defineEmits<{
  toggleSidebar: [];
}>();
</script>

<template>
  <header class="flex h-11 items-center border-b border-border/60 px-3 backdrop-blur-sm bg-background/80">
    <div class="flex items-center gap-2.5">
      <Button
        variant="ghost"
        size="icon"
        class="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
        @click="$emit('toggleSidebar')"
      >
        <Menu class="h-4 w-4" />
      </Button>
      <div class="flex items-center gap-2">
        <img :src="logo" alt="Logo" class="h-5 w-5" />
        <h1 class="text-sm font-semibold tracking-tight">Simple PvP</h1>
        <span class="text-[10px] font-mono text-muted-foreground/60 tracking-wider">COMPANION</span>
      </div>
    </div>
  </header>
</template>
