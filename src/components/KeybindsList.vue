<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Keyboard } from "lucide-vue-next";
import KeyboardKey from "./KeyboardKey.vue";
import { useSettingsStore } from "@/stores/settings";

const settings = useSettingsStore();
const remapping = ref<string | null>(null);
const pressedKeys = ref<string[]>([]);

onMounted(() => {
  settings.fetchKeybinds();
});

function startRemap(originalKey: string) {
  remapping.value = originalKey;
  pressedKeys.value = [];
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
}

function onKeyDown(e: KeyboardEvent) {
  e.preventDefault();
  const key = e.key === " " ? "Space" : e.key;
  if (!pressedKeys.value.includes(key)) {
    pressedKeys.value.push(key);
  }
}

function onKeyUp() {
  if (pressedKeys.value.length === 0 || !remapping.value) return;
  const combo = pressedKeys.value.join("+");
  settings.updateKeybind(remapping.value, combo);
  cancelRemap();
}

function cancelRemap() {
  remapping.value = null;
  pressedKeys.value = [];
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
}
</script>

<template>
  <Card class="border-border/60 bg-card">
    <CardHeader class="px-4 py-3">
      <CardTitle class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Keyboard class="h-3.5 w-3.5 text-primary" />
        Keybinds
      </CardTitle>
    </CardHeader>
    <CardContent class="px-4 pb-4">
      <div
        v-if="remapping"
        class="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center animate-fade-in"
      >
        <p class="text-xs text-muted-foreground">
          Press new key combination for
          <strong class="text-primary font-mono">{{ remapping }}</strong>
        </p>
        <p v-if="pressedKeys.length" class="mt-2 text-base font-mono text-foreground">
          {{ pressedKeys.join(" + ") }}
        </p>
        <Button
          variant="ghost"
          size="sm"
          class="mt-2 h-6 text-[11px] text-muted-foreground hover:text-foreground"
          @click="cancelRemap"
        >
          Cancel
        </Button>
      </div>

      <div class="space-y-0.5">
        <div
          v-for="kb in settings.keybinds"
          :key="kb.original_key"
          class="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-secondary/30"
        >
          <span class="text-xs text-foreground/80">{{ kb.description }}</span>
          <Button
            variant="outline"
            size="sm"
            class="h-6 border-border/60 text-xs hover:bg-secondary hover:border-border transition-all"
            :disabled="!!remapping"
            @click="startRemap(kb.original_key)"
          >
            <KeyboardKey :keys="kb.new_key" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
