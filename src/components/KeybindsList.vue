<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  <Card>
    <CardHeader class="pb-3">
      <CardTitle class="text-sm font-medium">Keybinds</CardTitle>
    </CardHeader>
    <CardContent>
      <div
        v-if="remapping"
        class="mb-4 rounded-lg border bg-muted p-4 text-center"
      >
        <p class="text-sm text-muted-foreground">
          Press new key combination for:
          <strong>{{ remapping }}</strong>
        </p>
        <p v-if="pressedKeys.length" class="mt-2 text-lg font-mono">
          {{ pressedKeys.join(" + ") }}
        </p>
        <Button variant="ghost" size="sm" class="mt-2" @click="cancelRemap">
          Cancel
        </Button>
      </div>

      <div class="space-y-2">
        <div
          v-for="kb in settings.keybinds"
          :key="kb.original_key"
          class="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50"
        >
          <span class="text-sm">{{ kb.description }}</span>
          <Button
            variant="outline"
            size="sm"
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
