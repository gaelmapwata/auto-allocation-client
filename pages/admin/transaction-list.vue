<template>
  <div class="page-container">
    <v-card rounded="xl" elevation="0" style="overflow: visible; position: relative; z-index: 2;">
      <v-card-text>
        <TransactionFiltre
          v-model="filter"
          @filter="handleFilter()"
        />
      </v-card-text>
    </v-card>

    <v-card :loading="transactionsLoading" class="mt-2" rounded="xl" elevation="0">
      <v-card-text>
        <div class="d-flex justify-end">
          <a :href="csvExportLink" target="_blank">
            <v-btn
              class="text-none"
              color="primary"
              rounded="xl"
              elevation="0"
              append-icon="mdi-file-excel"
              @click="handleExportCsv()"
            >
              <span class="text-none">Exporter</span>
            </v-btn>
          </a>
        </div>

        <v-divider class="mt-4" />

        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :headers="(headers as any)"
          :items-length="totalItems"
          :items="transactions"
          :loading="transactionsLoading"
          item-value="id"
          items-per-page-text="Items par page"
          @update:options="loadTransactions"
        >
          <template #[`item.index`]="{ index }">
            {{ (itemsPerPage * (page - 1)) + index + 1 }}
          </template>
          <template #[`item.createdAt`]="{ item }">
            {{ formatters.formatDateFns(item.createdAt) }}
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
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { formatters } from '@/utilities/formatter.util'
import { TransactionI } from '@/types/transaction'
import { useTransactionStore } from '@/stores/transaction'
import { useSnackbarStore } from '@/stores/snackbar'

definePageMeta({
  layout: 'admin'
})

useAdminBreadcrumb('mdi-security', [{
  title: 'Transactions',
  href: '/admin/transaction-list'
}])

const config = useRuntimeConfig()
const transactionStore = useTransactionStore()
const snackbarStore = useSnackbarStore()
const { fetchTransactions } = transactionStore
const { showSuccessSnackbar } = snackbarStore

const itemsPerPage = ref(10)
const page = ref(1)
const transactions = ref<TransactionI[]>([])
const transactionsLoading = ref(false)
const filter = ref({
  success: true
})
const totalItems = ref(0)

const csvExportLink = computed(() => {
  const params = new URLSearchParams()
  // eslint-disable-next-line no-restricted-syntax
  for (const key in filter.value) {
    if (Object.hasOwnProperty.call(filter.value, key)) {
      params.append(key, String(filter.value[key]))
    }
  }
  return `${config.public.baseURL}/transactions/download-csv?${params.toString()}`
})

const headers = [
  {
    title: '#',
    align: 'start',
    sortable: false,
    key: 'index'
  },
  {
    title: 'Date',
    key: 'createdAt',
    sortable: false
  },
  {
    title: 'MSISDN',
    key: 'msisdn',
    sortable: false
  },
  {
    title: 'Agent',
    key: 'lastName',
    sortable: false
  },
  {
    title: 'Effectué par',
    key: 'user',
    sortable: false
  },
  {
    title: 'Montant',
    key: 'amount',
    sortable: false
  },
  {
    title: 'Devise',
    key: 'currency',
    sortable: false
  },
  {
    title: 'Statut',
    key: 'success',
    sortable: false
  }
]

function handleFilter () {
  page.value = 1
  loadTransactions()
}

async function loadTransactions () {
  transactionsLoading.value = true
  const { data, total } = await fetchTransactions(
    {
      page: page.value,
      limit: itemsPerPage.value,
      filter: { ...filter.value }
    }
  )
  transactions.value = data
  totalItems.value = total
  transactionsLoading.value = false
}

function handleExportCsv () {
  showSuccessSnackbar('Le téléchargement du ficher a été lancé')
}

loadTransactions()
</script>
