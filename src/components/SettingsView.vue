<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Save, Check, Key, Loader2 } from "lucide-vue-next";
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
    }>("validate_api_key", { apiKey: apiKeyInput.value });

    await settings.saveApiKey(apiKeyInput.value);
    await user.setUser(player.id, player.guild?.id ?? 0);

    toast.success(`Logged in as ${player.name}`);
  } catch (e: any) {
    toast.error(e?.toString() ?? "Invalid API key");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-3">
    <Card class="border-border/60 bg-card">
      <CardHeader class="px-4 py-3">
        <CardTitle class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Key class="h-3.5 w-3.5 text-primary" />
          API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent class="px-4 pb-4">
        <div class="flex items-end gap-2">
          <div class="flex-1">
            <label class="mb-1 block text-[11px] font-medium text-muted-foreground tracking-wide uppercase">API Key</label>
            <Input
              v-model="apiKeyInput"
              type="password"
              placeholder="Enter your SimpleMMO API key"
              class="h-8 bg-secondary/50 border-border/60 text-sm font-mono"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            :disabled="!apiKeyInput.trim() || saving"
            class="h-8 border-border/60 text-xs hover:bg-secondary transition-colors"
            @click="saveApiKey"
          >
            <Loader2 v-if="saving" class="mr-1.5 h-3 w-3 animate-spin" />
            <Save v-else class="mr-1.5 h-3 w-3" />
            {{ saving ? "Validating..." : "Save" }}
          </Button>
        </div>
        <p v-if="settings.apiKey" class="mt-2 flex items-center gap-1 text-[11px] text-emerald-400">
          <Check class="h-3 w-3" /> API key configured
        </p>
      </CardContent>
    </Card>

    <Separator class="bg-border/40" />

    <KeybindsList />
  </div>
</template>
