<template>
  <v-card class="layout-header-container" rounded="xl" elevation="0">
    <template #text>
      <div class="d-flex justify-space-between align-center px-2">
        <h1>AUTO ALLOCATION</h1>

        <div class="d-flex">
          <v-btn
            class="ml-3"
            color="primary"
            icon="mdi-refresh"
            size="small"
            @click="reloadNuxtApp()"
          />
        </div>
      </div>
    </template>
  </v-card>
</template>

<style lang="scss">
  .layout-header-container {
    h1 {
      font-family: 'Monoton', sans-serif;
      font-weight: 100;
      font-size: 28px;
    }
  }
</style>
