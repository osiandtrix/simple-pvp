<script setup lang="ts">
import { computed } from "vue";

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
      <span v-if="i > 0" class="text-[10px] text-muted-foreground/40">+</span>
      <span class="inline-flex items-center justify-center rounded bg-secondary/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground border border-border/40">
        {{ key }}
      </span>
    </template>
  </span>
</template>
