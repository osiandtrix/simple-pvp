<template>
  <v-main style="height: 100vh; overflow: hidden">
    <v-card class="px-5">
      <v-card-title>
        <v-row class="mx-0">
          <v-col cols="10" class="px-0 pb-0">
            <h3 class="pt-4">Migrations</h3>
          </v-col>
        </v-row>
      </v-card-title>

      <v-row class="my-2" v-if="migrations.length === 0">
        <v-spacer></v-spacer>
        All migrations installed
        <v-spacer></v-spacer>
      </v-row>
      <v-row class="my-2" v-if="migrations.length === 0">
        <v-spacer></v-spacer>
        <v-btn @click="$emit('reload')"> Reload </v-btn>
        <v-spacer></v-spacer>
      </v-row>

      <v-card
        v-else
        rounded
        border
        class="ma-2 px-3"
        style="height: 40vh; overflow-y: scroll; font-size: 0.8rem"
      >
        <v-row id="headers" class="mb-3">
          <v-col cols="2">
            <v-icon>mdi-download</v-icon>
          </v-col>
          <v-col cols="4">Version</v-col>
          <v-col cols="6">Description</v-col>
        </v-row>
        <v-row
          v-for="(migration, i) in migrations"
          :class="mod(i, 2) === 0 ? 'evenElement' : 'oddElement'"
        >
          <v-col cols="2">
            <v-btn
              size="x-small"
              icon
              :disabled="i > 0"
              @click="installMigration(migration)"
            >
              <v-icon size="xs" v-if="loading && i === 0" class="rotating">
                mdi-loading
              </v-icon>
              <v-icon
                v-else
                style="cursor: pointer"
                :color="i > 0 ? 'grey' : 'blue'"
              >
                mdi-download
              </v-icon>
            </v-btn>
            <v-tooltip activator="parent" location="right">
              Install Migration
            </v-tooltip>
          </v-col>
          <v-col cols="4">db.v.{{ parseInt(migration.version) }}</v-col>
          <v-col cols="6">{{ migration.description }}</v-col>
        </v-row>
      </v-card>
    </v-card>
  </v-main>
</template>

<script lang="ts">
import Migration from "../../../../electron/types/DatabaseMigration";

export default {
  name: "migrations",
  data() {
    return {
      loading: false,
      migrations: [] as Array<Migration>,
    };
  },
  mounted() {
    window.api.receive("resolveVersion", ({ migrations }: any) => {
      this.migrations = migrations;
      this.loading = false;
    });
  },
  methods: {
    mod(n: number, m: number) {
      return n % m;
    },
    installMigration(migration: Migration) {
      this.loading = true;

      window.api.send(
        "installMigration",
        JSON.parse(JSON.stringify(migration))
      );
    },
  },
};
</script>

<style scoped>
.oddElement {
  background-color: rgb(26, 26, 26);
}

.evenElement {
  background-color: rgb(37, 37, 37);
}
.rotating {
  -webkit-animation: rotating 1s linear infinite;
  -moz-animation: rotating 1s linear infinite;
  -ms-animation: rotating 1s linear infinite;
  -o-animation: rotating 1s linear infinite;
  animation: rotating 1s linear infinite;
}
</style>
