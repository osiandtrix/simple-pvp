<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-vue-next";
import { useSettingsStore } from "@/stores/settings";

const settings = useSettingsStore();

interface ChangelogEntry {
  version: string;
  date: string;
  changes: { type: "added" | "changed" | "fixed" | "removed"; text: string }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: "1.2.3",
    date: "2026-02-08",
    changes: [
      { type: "fixed", text: "Getting stuck on the last loaded target - prefetch now properly loads more targets as you approach the end" },
      { type: "added", text: "Graceful exit when all guild targets have been exhausted" },
    ],
  },
  {
    version: "1.2.2",
    date: "2026-02-08",
    changes: [
      { type: "fixed", text: "Getting stuck on 0 HP targets - Space now advances to the next target before navigating" },
    ],
  },
  {
    version: "1.2.1",
    date: "2026-02-08",
    changes: [
      { type: "fixed", text: "Double combat log entries on Windows without admin due to global shortcut double-fire" },
      { type: "fixed", text: "Duplicate targets in queue - targets are now deduplicated by user ID" },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-02-08",
    changes: [
      { type: "changed", text: "Persistent HTTP client for faster API calls via connection reuse" },
      { type: "changed", text: "Parallel guild fetching - up to 3 guilds loaded concurrently" },
      { type: "fixed", text: "Duplicate targets from guild batch wrapping causing doubled combat logs" },
      { type: "removed", text: "Removed mark hit/not-hit keybinds and related code" },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-02-08",
    changes: [
      { type: "added", text: "Single-guild targeting via crosshair button in war list" },
      { type: "added", text: "Auto-exit combat when all single-guild targets are done" },
      { type: "added", text: "App logo in header" },
      { type: "changed", text: "Redesigned UI with purple accent theme" },
      { type: "changed", text: "War list now sorted by your kills (descending) by default" },
      { type: "changed", text: "Keybind status is now an automatic indicator instead of a toggle" },
      { type: "changed", text: "Keybind labels use proper capitalization" },
      { type: "fixed", text: "Duplicate combat log entries caused by concurrent keypress handling" },
      { type: "fixed", text: "Global shortcut handler accumulation causing repeated events" },
      { type: "removed", text: "Removed always-on-top window feature" },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-02-08",
    changes: [
      { type: "added", text: "Complete rewrite with Tauri v2 backend" },
      { type: "added", text: "Modern UI with shadcn-vue components and dark theme" },
      { type: "added", text: "Server-side API rate limiting with header tracking" },
      { type: "added", text: "Changelog page" },
      { type: "added", text: "Customizable keybinds with live remapping" },
      { type: "added", text: "Combat event log with target/guild/API counters" },
      { type: "changed", text: "Migrated from Electron to Tauri v2 for smaller binary and better performance" },
      { type: "changed", text: "Replaced Vuetify with shadcn-vue + Tailwind CSS" },
      { type: "changed", text: "Replaced Vuex with Pinia for state management" },
      { type: "changed", text: "API calls moved to Rust backend with proper rate limiting" },
      { type: "changed", text: "Combat browser window now uses Tauri webview" },
      { type: "removed", text: "Removed Electron and all legacy code" },
    ],
  },
];

const badgeColors: Record<string, string> = {
  added: "bg-emerald-500/10 text-emerald-400 border-0",
  changed: "bg-primary/10 text-primary border-0",
  fixed: "bg-yellow-500/10 text-yellow-400 border-0",
  removed: "bg-red-500/10 text-red-400 border-0",
};
</script>

<template>
  <div class="space-y-3">
    <Card v-for="entry in changelog" :key="entry.version" class="border-border/60 bg-card">
      <CardHeader class="px-4 py-3">
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <FileText class="h-3.5 w-3.5 text-primary" />
            <span class="font-mono">v{{ entry.version }}</span>
            <Badge
              v-if="entry.version === settings.appVersion"
              class="h-4 rounded px-1.5 text-[10px] font-mono bg-primary/10 text-primary border-0"
            >
              Current
            </Badge>
          </CardTitle>
          <span class="text-[10px] font-mono text-muted-foreground/60">{{ entry.date }}</span>
        </div>
      </CardHeader>
      <CardContent class="px-4 pb-4">
        <ScrollArea class="max-h-[60vh]">
          <ul class="space-y-1.5">
            <li
              v-for="(change, i) in entry.changes"
              :key="i"
              class="flex items-start gap-2 text-xs animate-in"
              :style="{ animationDelay: `${i * 30}ms` }"
            >
              <Badge :class="badgeColors[change.type]" class="mt-0.5 shrink-0 text-[10px] px-1.5 py-0 rounded font-medium">
                {{ change.type.charAt(0).toUpperCase() + change.type.slice(1) }}
              </Badge>
              <span class="text-foreground/80">{{ change.text }}</span>
            </li>
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  </div>
</template>
