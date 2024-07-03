<template>
  <div class="page-mini-container">
    <v-card rounded="xl" elevation="0">
      <v-card-text>
        <div class="text-center py-16">
          <h1 class="mb-10">
            You are not authorized to access this page
          </h1>
          <v-btn to="/" color="primary" rounded="xl" elevation="0">
            <span class="text-none">Back to home page</span>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'admin'
})
</script>
