<template>
  <v-card class="modern-warlist-card glass-effect" elevation="0">
    <!-- API Key Warning -->
    <v-alert
      v-if="!keySet"
      type="warning"
      variant="tonal"
      class="ma-4"
      icon="mdi-key-alert"
    >
      <v-alert-title>API Key Required</v-alert-title>
      Please configure your Simple MMO API key to view guild wars.
    </v-alert>

    <!-- Warlist Header -->
    <v-card-title class="modern-warlist-header">
      <div class="d-flex align-center justify-space-between w-100">
        <div class="d-flex align-center">
          <h2 class="gradient-text font-weight-bold">Guild Wars</h2>
          <v-chip
            v-if="warlist && warlist.length > 0"
            size="small"
            color="primary"
            variant="flat"
            class="ml-3"
          >
            {{ warlist.length }} wars
          </v-chip>
          <v-icon size="28" color="primary" class="ml-3">mdi-shield-sword</v-icon>
        </div>

        <!-- Action Buttons -->
        <div class="d-flex align-center">
          <v-btn
            icon
            variant="text"
            size="small"
            :disabled="!keySet || !warlist || warlist.length <= 0"
            @click="shuffleWars"
            class="modern-action-btn mr-2"
          >
            <v-icon color="accent">mdi-shuffle-variant</v-icon>
            <v-tooltip activator="parent" location="top">
              Shuffle Wars
            </v-tooltip>
          </v-btn>

          <v-btn
            icon
            variant="text"
            size="small"
            :disabled="!keySet || fetchingWars"
            @click="updateWarData"
            class="modern-action-btn"
          >
            <v-icon
              v-if="fetchingWars"
              class="rotating"
              color="primary"
            >
              mdi-loading
            </v-icon>
            <v-icon v-else color="success">mdi-refresh</v-icon>
            <v-tooltip activator="parent" location="top">
              {{ fetchingWars ? 'Updating...' : 'Update War Data' }}
            </v-tooltip>
          </v-btn>
        </div>
      </div>
    </v-card-title>

    <!-- Warlist Table -->
    <v-card-text class="pa-4">
      <div class="modern-table-container">
        <!-- Table Headers -->
        <div class="modern-table-header">
          <div class="header-cell guild-name-header">
            <v-icon size="16" color="on-surface-variant" class="mr-2">mdi-shield</v-icon>
            Guild Name
          </div>
          <div
            class="header-cell sortable-header"
            @click="sortBy('yourKills')"
          >
            <v-icon size="16" color="combat-friendly" class="mr-1">mdi-sword</v-icon>
            Your Kills
            <v-icon size="16" class="ml-2 sort-icon">
              {{ getSortIcon('yourKills') }}
            </v-icon>
          </div>
          <div
            class="header-cell sortable-header"
            @click="sortBy('theirKills')"
          >
            <v-icon size="16" color="combat-enemy" class="mr-1">mdi-shield-cross</v-icon>
            Their Kills
            <v-icon size="16" class="ml-2 sort-icon">
              {{ getSortIcon('theirKills') }}
            </v-icon>
          </div>
          <div class="header-cell action-header">
            <v-icon size="16" color="on-surface-variant" class="mr-1">mdi-crosshairs-gps</v-icon>
            Target
          </div>
        </div>

        <!-- Table Body -->
        <div class="modern-table-body">
          <div
            v-for="(war, i) in warlist"
            :key="i"
            class="war-row"
            :class="{ 'war-row-even': i % 2 === 0 }"
          >
            <!-- Your guild is guild_1 -->
            <template v-if="guildId === war.guild_1.id">
              <div class="row-cell guild-name-cell">
                <v-avatar size="24" class="mr-3">
                  <v-icon size="16" color="on-surface-variant">mdi-shield-outline</v-icon>
                </v-avatar>
                {{ war.guild_2.name }}
              </div>
              <div class="row-cell kills-cell friendly-kills">
                <div class="square-badge friendly-badge">
                  {{ war.guild_1.kills }}
                </div>
              </div>
              <div class="row-cell kills-cell enemy-kills">
                <div class="square-badge enemy-badge">
                  {{ war.guild_2.kills }}
                </div>
              </div>
              <div class="row-cell action-cell">
                <v-btn
                  @click="targetGuild(war.guild_2)"
                  icon
                  size="small"
                  variant="text"
                  color="primary"
                  class="aim-button"
                >
                  <v-icon size="18">mdi-crosshairs-gps</v-icon>
                  <v-tooltip activator="parent" location="left">
                    Target {{ war.guild_2.name }}
                  </v-tooltip>
                </v-btn>
              </div>
            </template>

            <!-- Your guild is guild_2 -->
            <template v-else-if="guildId === war.guild_2.id">
              <div class="row-cell guild-name-cell">
                <v-avatar size="24" class="mr-3">
                  <v-icon size="16" color="on-surface-variant">mdi-shield-outline</v-icon>
                </v-avatar>
                {{ war.guild_1.name }}
              </div>
              <div class="row-cell kills-cell friendly-kills">
                <div class="square-badge friendly-badge">
                  {{ war.guild_2.kills }}
                </div>
              </div>
              <div class="row-cell kills-cell enemy-kills">
                <div class="square-badge enemy-badge">
                  {{ war.guild_1.kills }}
                </div>
              </div>
              <div class="row-cell action-cell">
                <v-btn
                  @click="targetGuild(war.guild_1)"
                  icon
                  size="small"
                  variant="text"
                  color="primary"
                  class="aim-button"
                >
                  <v-icon size="18">mdi-crosshairs-gps</v-icon>
                  <v-tooltip activator="parent" location="left">
                    Target {{ war.guild_1.name }}
                  </v-tooltip>
                </v-btn>
              </div>
            </template>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!warlist || warlist.length === 0" class="empty-state">
          <v-icon size="48" color="on-surface-variant" class="mb-4">mdi-shield-off</v-icon>
          <h3 class="text-h6 mb-2">No Active Wars</h3>
          <p class="text-body-2 text-on-surface-variant">
            {{ keySet ? 'Your guild is not currently in any wars.' : 'Configure your API key to view wars.' }}
          </p>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
export default {
  name: "warlist",
  data() {
    return {
      fetchingWars: false,
      headers: [
        { text: "Guild Name", value: "name" },
        { text: "Your Kills", value: "yourKills" },
        { text: "Their Kills", value: "theirKills" },
      ] as Array<any>,
    };
  },
  computed: {
    rawWarlist() {
      return this.$store.getters["wars/rawWarlist"];
    },
    warlist() {
      return this.$store.getters["wars/warlist"];
    },
    guildId() {
      return this.$store.getters["user/guildId"];
    },
    sortField() {
      return this.$store.getters["wars/sortField"];
    },
    sortDirection() {
      return this.$store.getters["wars/sortDirection"];
    },
  },
  methods: {
    showAPILimitError() {
      const secondsTillReset: number =
        60 -
        (Math.floor(new Date().getTime() / 1000) -
          this.$store.getters["process/apiLimit_Stamp"]);

      this.$toast.error(
        `You have reached the API Limit. Try again in ${secondsTillReset}s`
      );
    },
    mod(a: number, b: number) {
      return a % b;
    },
    sort(param: string) {
      this.warlist.sort((a: any, b: any) => a[param].localeCompare(b[param]));
    },
    sortBy(field: string) {
      this.$store.dispatch("wars/sortWarlist", {
        field: field,
        userGuildId: this.guildId
      });
    },
    getSortIcon(field: string) {
      if (this.sortField !== field) {
        return 'mdi-sort';
      }
      return this.sortDirection === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending';
    },
    async updateWarData() {
      this.fetchingWars = true;

      if (this.$store.getters["process/apiLimit"] >= 40)
        return this.showAPILimitError();

      const options = {
        apiKey: this.$store.getters["settings/apiKey"],
        guildId: this.$store.getters["user/guildId"],
      };

      const newWarlist = await this.$store
        .dispatch("wars/updateWars", options)
        .catch(() => {
          this.$store.dispatch("process/setApiLimit", 40);
        });

      if (!newWarlist || newWarlist.length === 0)
        return this.$toast.error("You have no active wars.");

      this.warlist = JSON.parse(JSON.stringify(newWarlist));

      this.fetchingWars = false;
    },
    async shuffleWars() {
      await this.$store.dispatch("wars/shuffleWars");

      this.$store.dispatch(
        "wars/overwriteWarlist",
        JSON.parse(JSON.stringify(this.warlist))
      );
    },
    targetGuild(guild: any) {
      // Emit event to parent component to start targeting this specific guild
      this.$emit('targetSpecificGuild', guild);
    },
  },
  props: {
    keySet: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.modern-warlist-card {
  background: rgba(26, 26, 26, 0.85) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  height: calc(100vh - 280px);
  display: flex;
  flex-direction: column;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.modern-warlist-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modern-action-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.9) 0%, rgba(58, 58, 58, 0.9) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.modern-action-btn:hover {
  background: linear-gradient(135deg, rgba(58, 58, 58, 0.9) 0%, rgba(74, 74, 74, 0.9) 100%) !important;
  transform: scale(1.05);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.modern-table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modern-table-header {
  display: flex;
  background: rgba(42, 42, 42, 0.6);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.header-cell {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.guild-name-header {
  flex: 1;
}

.header-cell:not(.guild-name-header) {
  width: 150px;
  justify-content: center;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  padding: 8px 12px;
  margin: -8px -12px;
}

.sortable-header:hover {
  background-color: rgba(58, 58, 58, 0.3);
  transform: translateY(-1px);
}

.sort-icon {
  transition: all 0.3s ease;
  opacity: 0.7;
}

.sortable-header:hover .sort-icon {
  opacity: 1;
  transform: scale(1.1);
}

.modern-table-body {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.war-row {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 8px;
  background: rgba(16, 16, 16, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.war-row:hover {
  background: rgba(32, 32, 32, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.war-row-even {
  background: rgba(32, 32, 32, 0.6);
}

.war-row-even:hover {
  background: rgba(48, 48, 48, 0.8);
}

.row-cell {
  display: flex;
  align-items: center;
}

.guild-name-cell {
  flex: 1;
  font-weight: 500;
  font-size: 0.95rem;
}

.kills-cell {
  width: 150px;
  justify-content: center;
}

.action-cell {
  width: 150px;
  justify-content: center;
}

.aim-button {
  opacity: 0.7;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.aim-button:hover {
  opacity: 1;
  transform: scale(1.1);
  background: rgba(var(--v-theme-primary), 0.1) !important;
}

.square-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  max-width: 70px;
  height: 28px;
  padding: 0 6px;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.friendly-badge {
  background: rgba(var(--v-theme-combat-friendly), 0.15);
  color: rgb(var(--v-theme-combat-friendly));
  border-color: rgba(var(--v-theme-combat-friendly), 0.3);
}

.enemy-badge {
  background: rgba(var(--v-theme-combat-enemy), 0.15);
  color: rgb(var(--v-theme-combat-enemy));
  border-color: rgba(var(--v-theme-combat-enemy), 0.3);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
}

.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Custom scrollbar for table body */
.modern-table-body::-webkit-scrollbar {
  width: 6px;
}

.modern-table-body::-webkit-scrollbar-track {
  background: rgba(42, 42, 42, 0.3);
  border-radius: 3px;
}

.modern-table-body::-webkit-scrollbar-thumb {
  background: rgba(106, 106, 106, 0.6);
  border-radius: 3px;
}

.modern-table-body::-webkit-scrollbar-thumb:hover {
  background: rgba(106, 106, 106, 0.8);
}

/* Responsive adjustments for table headers */
@media (max-width: 768px) {
  .header-cell:not(.guild-name-header) {
    width: 130px;
  }

  .kills-cell {
    width: 130px;
  }

  .sortable-header {
    padding: 6px 8px;
    margin: -6px -4px;
  }
}

@media (max-width: 480px) {
  .header-cell:not(.guild-name-header) {
    width: 110px;
  }

  .kills-cell {
    width: 110px;
  }

  .header-cell {
    font-size: 0.75rem;
  }

  .sortable-header {
    padding: 4px 6px;
    margin: -4px -2px;
  }
}
</style>
