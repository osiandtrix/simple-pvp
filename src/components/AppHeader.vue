<script setup lang="ts">
import { Menu, User, HelpCircle } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

defineEmits<{
  toggleSidebar: [];
}>();
</script>

<template>
  <header class="flex h-12 items-center justify-between border-b px-4">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="icon" @click="$emit('toggleSidebar')">
        <Menu class="h-5 w-5" />
      </Button>
      <h1 class="text-lg font-semibold">Simple Companion PvP</h1>
    </div>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon">
          <User class="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <HelpCircle class="mr-2 h-4 w-4" />
          Help
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
</template>
