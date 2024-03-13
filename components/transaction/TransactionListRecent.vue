<template>
  <div>
    <v-data-table
      :headers="(headers as any)"
      :items="transactions"
      :loading="transactionsLoading"
      item-value="id"
    >
      <template #[`item.createdAt`]="{ item }">
        {{ item.createdAt ? formatters.formatDateFns(item.createdAt) : '-' }}
      </template>
      <template #[`item.lastName`]="{ item }">
        {{ item.lastName }} {{ item.firstName }}
      </template>
      <template #[`item.user`]="{ item }">
        {{ item.user.email }}
      </template>
      <template #[`item.amount`]="{ item }">
        {{ formatters.formatPrice(item.amount) }}
      </template>
      <template #[`item.success`]="{ item }">
        <v-chip v-if="item.success" variant="flat" color="green" append>
          <v-icon start icon="mdi-check" />
          Succès
        </v-chip>

        <v-tooltip v-else :text="item.error">
          <template #activator="{ props }">
            <v-chip v-bind="props" variant="flat" color="red">
              <v-icon start icon="mdi-alert-circle" />
              Échec
            </v-chip>
          </template>
        </v-tooltip>
      </template>
      <template #bottom>
        <!-- just for hide -->
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts" setup>
import { formatters } from '@/utilities/formatter.util'
import { TransactionI } from '@/types/transaction'
import { useTransactionStore } from '@/stores/transaction'

const transactionStore = useTransactionStore()
const { fetchTransactions } = transactionStore

const transactions = ref<TransactionI[]>([])
const transactionsLoading = ref(false)

const headers = [
  {
    title: 'Date',
    key: 'createdAt'
  },
  {
    title: 'MSISDN',
    key: 'msisdn'
  },
  {
    title: 'Agent',
    key: 'lastName'
  },
  {
    title: 'Effectué par',
    key: 'user'
  },
  {
    title: 'Montant',
    key: 'amount'
  },
  {
    title: 'Devise',
    key: 'currency'
  },
  {
    title: 'Statut',
    key: 'success'
  }
]

async function loadTransactions () {
  transactionsLoading.value = true
  const { data } = await fetchTransactions(
    {
      page: 0,
      limit: 10
    }
  )
  transactions.value = data
  transactionsLoading.value = false
}

loadTransactions()
</script>
