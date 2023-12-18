<template>
  <div class="d-flex flex-wrap">
    <v-card min-width="140px" class="mr-4 mb-4">
      <v-card-text class="text-center">
        <span>Aujourd'hui</span>
        <p class="text-h3">
          {{ stats.today }}
        </p>
      </v-card-text>
    </v-card>

    <v-card min-width="140px" class="mr-4 mb-4">
      <v-card-text class="text-center">
        <span>Hier</span>
        <p class="text-h3">
          {{ stats.yesterday }}
        </p>
      </v-card-text>
    </v-card>

    <v-card min-width="140px" class="mr-4 mb-4">
      <v-card-text class="text-center">
        <span>Cette semaine</span>
        <p class="text-h3">
          {{ stats.currentWeek }}
        </p>
      </v-card-text>
    </v-card>

    <v-card min-width="140px" class="mb-4">
      <v-card-text class="text-center">
        <span>Ce Mois</span>
        <p class="text-h3">
          {{ stats.currentMonth }}
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { useTransactionStore } from '@/stores/transaction'
import { storeToRefs } from 'pinia'

const transactionStore = useTransactionStore()
const { getTransactionsStats } = transactionStore
const { stats } = storeToRefs(transactionStore)

getTransactionsStats()
</script>
