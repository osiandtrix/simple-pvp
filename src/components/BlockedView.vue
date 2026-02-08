<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ban } from "lucide-vue-next";
import { useBlocklistStore } from "@/stores/blocklist";
import { toast } from "vue-sonner";

const blocklist = useBlocklistStore();

async function handleUnblock(guildId: number, guildName: string) {
  await blocklist.unblockGuild(guildId);
  toast.success(`Unblocked ${guildName}`);
}
</script>

<template>
  <Card class="border-border/60 bg-card">
    <CardHeader class="px-4 py-3">
      <div class="flex items-center gap-2">
        <CardTitle class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Ban class="h-3.5 w-3.5 text-primary" />
          Blocked Guilds
        </CardTitle>
        <Badge
          v-if="blocklist.blockedGuilds.length > 0"
          class="h-4 rounded px-1.5 text-[10px] font-mono bg-primary/10 text-primary border-0"
        >
          {{ blocklist.blockedGuilds.length }}
        </Badge>
      </div>
    </CardHeader>
    <CardContent class="px-4 pb-4">
      <div class="max-h-[60vh] overflow-y-auto">
        <table v-if="blocklist.blockedGuilds.length > 0" class="w-full text-sm">
          <thead>
            <tr class="border-b border-border/40">
              <th class="pb-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Guild
              </th>
              <th class="pb-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                ID
              </th>
              <th class="pb-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="guild in blocklist.blockedGuilds"
              :key="guild.guild_id"
              class="group border-b border-border/20 transition-colors hover:bg-secondary/30"
            >
              <td class="py-1.5 text-xs font-medium">{{ guild.guild_name }}</td>
              <td class="py-1.5 text-right font-mono text-xs text-muted-foreground">
                {{ guild.guild_id }}
              </td>
              <td class="py-1.5 text-right">
                <button
                  class="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:bg-emerald-500/10 hover:text-emerald-400"
                  title="Unblock this guild"
                  @click="handleUnblock(guild.guild_id, guild.guild_name)"
                >
                  <Ban class="h-3 w-3" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Ban class="mb-2 h-6 w-6 opacity-20" />
          <p class="text-xs">No blocked guilds</p>
          <p class="mt-1 text-[10px] text-muted-foreground/60">Block guilds from the war list to skip them</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
