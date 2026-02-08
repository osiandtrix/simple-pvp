<script setup lang="ts">
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";

const props = defineProps<{ keys: string }>();

const keyParts = computed(() =>
  props.keys.split("+").map((k) => {
    const map: Record<string, string> = {
      ArrowUp: "\u2191", ArrowDown: "\u2193",
      ArrowLeft: "\u2190", ArrowRight: "\u2192",
      Control: "Ctrl", " ": "Space",
    };
    return map[k] ?? k;
  })
);
</script>

<template>
  <span class="inline-flex items-center gap-0.5">
    <template v-for="(key, i) in keyParts" :key="i">
      <span v-if="i > 0" class="text-xs text-muted-foreground">+</span>
      <Badge variant="outline" class="px-1.5 py-0.5 font-mono text-xs">
        {{ key }}
      </Badge>
    </template>
  </span>
</template>
