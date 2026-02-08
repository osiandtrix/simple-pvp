<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSettingsStore } from "@/stores/settings";

const settings = useSettingsStore();

interface ChangelogEntry {
  version: string;
  date: string;
  changes: { type: "added" | "changed" | "fixed" | "removed"; text: string }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "2026-02-08",
    changes: [
      { type: "added", text: "Complete rewrite with Tauri v2 backend" },
      { type: "added", text: "Modern UI with shadcn-vue components and dark theme" },
      { type: "added", text: "Server-side API rate limiting with header tracking" },
      { type: "added", text: "Always-on-top window option" },
      { type: "added", text: "Changelog page" },
      { type: "added", text: "Customizable keybinds with live remapping" },
      { type: "added", text: "Combat event log with target/guild/API counters" },
      { type: "changed", text: "Migrated from Electron to Tauri v2 for smaller binary and better performance" },
      { type: "changed", text: "Replaced Vuetify with shadcn-vue + Tailwind CSS" },
      { type: "changed", text: "Replaced Vuex with Pinia for state management" },
      { type: "changed", text: "API calls moved to Rust backend with proper rate limiting" },
      { type: "removed", text: "Removed separate combat browser window (now in-app)" },
      { type: "removed", text: "Removed Electron and all legacy code" },
    ],
  },
];

const badgeVariant: Record<string, string> = {
  added: "text-green-400 border-green-400/30",
  changed: "text-blue-400 border-blue-400/30",
  fixed: "text-yellow-400 border-yellow-400/30",
  removed: "text-red-400 border-red-400/30",
};
</script>

<template>
  <div class="space-y-4">
    <Card v-for="entry in changelog" :key="entry.version">
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <CardTitle class="text-sm font-medium">
            v{{ entry.version }}
            <Badge v-if="entry.version === settings.appVersion" variant="secondary" class="ml-2">
              current
            </Badge>
          </CardTitle>
          <span class="text-xs text-muted-foreground">{{ entry.date }}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea class="max-h-[60vh]">
          <ul class="space-y-2">
            <li
              v-for="(change, i) in entry.changes"
              :key="i"
              class="flex items-start gap-2 text-sm"
            >
              <Badge variant="outline" :class="badgeVariant[change.type]" class="mt-0.5 shrink-0 text-[10px] px-1.5 py-0">
                {{ change.type }}
              </Badge>
              <span>{{ change.text }}</span>
            </li>
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  </div>
</template>
