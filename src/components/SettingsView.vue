<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Save, Check, Pin } from "lucide-vue-next";
import { toast } from "vue-sonner";
import KeybindsList from "./KeybindsList.vue";
import { useSettingsStore } from "@/stores/settings";
import { useUserStore } from "@/stores/user";

const settings = useSettingsStore();
const user = useUserStore();

const apiKeyInput = ref(settings.apiKey ?? "");
const saving = ref(false);

async function saveApiKey() {
  if (!apiKeyInput.value.trim()) return;
  saving.value = true;

  try {
    const player = await invoke<{
      id: number;
      name: string;
      guild?: { id: number; name: string };
    }>("validate_api_key", { api_key: apiKeyInput.value });

    await settings.saveApiKey(apiKeyInput.value);
    await user.setUser(player.id, player.guild?.id ?? 0);

    toast.success(`Logged in as ${player.name}`);
  } catch {
    toast.error("Invalid API key");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-4">
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-sm font-medium">API Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex items-end gap-3">
          <div class="flex-1">
            <label class="mb-1 block text-xs text-muted-foreground">API Key</label>
            <Input
              v-model="apiKeyInput"
              type="password"
              placeholder="Enter your SimpleMMO API key"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            :disabled="!apiKeyInput.trim() || saving"
            @click="saveApiKey"
          >
            <Save class="mr-2 h-3 w-3" />
            {{ saving ? "Validating..." : "Save" }}
          </Button>
        </div>
        <p v-if="settings.apiKey" class="mt-2 flex items-center gap-1 text-xs text-green-400">
          <Check class="h-3 w-3" /> API key configured
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-sm font-medium">Window</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Pin class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm">Always on top</span>
          </div>
          <Switch
            :checked="settings.alwaysOnTop"
            @update:checked="settings.setAlwaysOnTop($event)"
          />
        </div>
      </CardContent>
    </Card>

    <Separator />

    <KeybindsList />
  </div>
</template>
