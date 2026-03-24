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
    version: "1.6.1",
    date: "2026-03-23",
    changes: [
      { type: "fixed", text: "Rate limit no longer gets stuck showing \"resets in 0s\" after re-entering combat, which blocked all API calls until app restart" },
      { type: "fixed", text: "Combat no longer gets stuck on the last target when no new targets are available" },
      { type: "changed", text: "When all targets are exhausted, the app now waits for the rate limit to reset and retries before exiting combat" },
    ],
  },
  {
    version: "1.6.0",
    date: "2026-03-22",
    changes: [
      { type: "fixed", text: "4x kill cooldown now correctly identified as 4x instead of being misclassified as 3x" },
      { type: "fixed", text: "Kill-blocked detection now checks the page before recording a kill, preventing false kill records when the attack actually failed" },
      { type: "fixed", text: "Kill-blocked state now resets properly when navigating to a new target" },
      { type: "fixed", text: "App no longer locks up when API rate limit is hit - fetching stops gracefully and shows a toast with reset countdown" },
      { type: "changed", text: "Target buffer increased from 5 to 20 for deeper target queues and fewer mid-session pauses" },
      { type: "changed", text: "Prefetch now triggers earlier (below 10 remaining targets instead of 3) to keep the queue full" },
      { type: "added", text: "Empty guild memory - guilds with no attackable players are skipped for the rest of the session to conserve API calls" },
      { type: "changed", text: "Rate limit is checked before each API call and before entering combat, preventing the UI from hanging" },
    ],
  },
  {
    version: "1.5.0",
    date: "2026-03-21",
    changes: [
      { type: "added", text: "Auto-detect kill cooldown popups (3x/12h and 4x/24h) in the combat webview and auto-skip to the next target" },
      { type: "added", text: "Per-kill timestamp tracking with sliding window cooldown logic matching the game's rules" },
      { type: "changed", text: "Targets on cooldown are now automatically filtered out when fetching and reappear once cooldown expires" },
      { type: "changed", text: "Combat event log now shows skipped targets with a yellow indicator" },
    ],
  },
  {
    version: "1.4.0",
    date: "2026-03-10",
    changes: [
      { type: "added", text: "macOS and Linux support - app now builds for all desktop platforms" },
      { type: "added", text: "Automated CI/CD releases via GitHub Actions" },
      { type: "changed", text: "Download page now detects your OS and offers the correct installer" },
    ],
  },
  {
    version: "1.3.4",
    date: "2026-02-09",
    changes: [
      { type: "fixed", text: "Overlay Back button now correctly navigates to the previous target" },
    ],
  },
  {
    version: "1.3.3",
    date: "2026-02-09",
    changes: [
      { type: "added", text: "Kills per hour stat displayed in the combat log during sessions" },
      { type: "added", text: "API rate limit counter now shows a hover tooltip with reset countdown" },
      { type: "changed", text: "Rate limiting now uses real API headers instead of a client-side counter for accurate tracking" },
    ],
  },
  {
    version: "1.3.2",
    date: "2026-02-08",
    changes: [
      { type: "removed", text: "Previous Target keybind removed - use the floating overlay Back button instead" },
      { type: "changed", text: "Next Target keybind (Space) is now locked and cannot be remapped" },
      { type: "changed", text: "Target fetching is now sequential (1 guild at a time) to reduce API usage" },
      { type: "changed", text: "Prefetch threshold lowered from 5 to 3 targets to conserve API calls" },
    ],
  },
  {
    version: "1.3.1",
    date: "2026-02-08",
    changes: [
      { type: "added", text: "Floating overlay with Back/Next buttons when keybinds are toggled off during combat" },
      { type: "removed", text: "Inline Back/Next buttons replaced by the floating overlay" },
    ],
  },
  {
    version: "1.3.0",
    date: "2026-02-08",
    changes: [
      { type: "added", text: "Guild blocklist - block guilds from the war list so they are skipped during combat" },
      { type: "added", text: "Blocked Guilds page to view and unblock guilds" },
      { type: "added", text: "Clickable keybinds indicator to toggle keybinds on/off during combat" },
      { type: "fixed", text: "Keybinds no longer fire on SimpleMMO login and direct message pages" },
    ],
  },
  {
    version: "1.2.6",
    date: "2026-02-08",
    changes: [
      { type: "added", text: "Quick-nav buttons for Food, Healer, and Energy pages below the combat log" },
      { type: "added", text: "API limit counter now shows a live countdown timer when the limit is reached" },
      { type: "fixed", text: "Combat window not reopening after being closed - stale window references are now cleaned up" },
    ],
  },
  {
    version: "1.2.5",
    date: "2026-02-08",
    changes: [
      { type: "fixed", text: "Combat failing to start when first few guilds have no valid targets - now tries all guilds before giving up" },
    ],
  },
  {
    version: "1.2.4",
    date: "2026-02-08",
    changes: [
      { type: "fixed", text: "Double combat log entries when targeting a specific guild - shortcut debounce moved to Rust for reliability" },
    ],
  },
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
