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
          <a
            v-if="userHasOneOfPermissions(currentUser, [PERMISSIONS.TRANSACTION.EXPORT])"
            target="_blank"
            @click="handleExportTransactions()"
          >
            <v-btn
              class="text-none"
              color="primary"
              rounded="xl"
              elevation="0"
              append-icon="mdi-file-excel"
              @click="handleExportCsv()"
            >
              <span class="text-none">Export</span>
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
            {{ item.createdAt ? formatters.formatDateFns(item.createdAt) : '-' }}
          </template>
          <template #[`item.lastName`]="{ item }">
            {{ item.lastName }} {{ item.firstName }}
          </template>
          <template #[`item.user`]="{ item }">
            {{ item.user.email }}
          </template>
          <template #[`item.checker`]="{ item }">
            {{ item.checker?.email || '-' }}
          </template>
          <template #[`item.amount`]="{ item }">
            {{ formatters.formatPrice(item.amount) }} {{ item.currency }}
          </template>
          <template #[`item.branch`]="{ item }">
            {{ item.branch?.label }}
          </template>
          <template #[`item.success`]="{ item }">
            <v-chip v-if="!item.checkerId" append>
              <v-icon start icon="mdi-clock-outline" />
              Pending validation
            </v-chip>

            <v-chip v-if="item.success" variant="flat" color="green" append>
              <v-icon start icon="mdi-check" />
              Success
            </v-chip>

            <v-tooltip v-else-if="item.error" :text="item.error">
              <template #activator="{ props }">
                <v-chip v-bind="props" variant="flat" color="red">
                  <v-icon start icon="mdi-alert-circle" />
                  Failure
                </v-chip>
              </template>
            </v-tooltip>
          </template>
          <template #[`item.actions`]="{ item }">
            <v-btn
              v-if="userHasOneOfPermissions(
                currentUser,
                [PERMISSIONS.TRANSACTION.REVALIDATE]
              ) && !item.success && item.isAuthorized && item.errorAirtelMoney"
              :disabled="actionInLoading"
              :loading="revalidateTransactionLoadings[item.id]"
              elevation="0"
              width="150"
              rounded="xl"
              append-icon="mdi-check"
              color="green"
              @click="onRevalidateTransaction(item)"
            >
              <span class="text-none">Re-Validate</span>
            </v-btn>

            <v-btn
              v-if="userHasOneOfPermissions(
                currentUser,
                [PERMISSIONS.TRANSACTION.AUTHORIZE_REVALIDATION]
              ) && !item.success && item.errorAirtelMoney"
              :disabled="actionInLoading"
              :loading="authorizeRevalidationTransactionLoadings[item.id]"
              elevation="0"
              width="150"
              rounded="xl"
              append-icon="mdi-check"
              color="green"
              @click="onAuthorizeToRevalidateTransaction(item)"
            >
              <span class="text-none">Authorize revalidation</span>
            </v-btn>
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
import { PERMISSIONS, shouldHaveOneOfPermissions, userHasOneOfPermissions } from '~/utilities/auth.util'
import { UserI } from '~/types/user'

definePageMeta({
  layout: 'admin',
  middleware: [(_, __, next) => shouldHaveOneOfPermissions({
    next, permissions: [PERMISSIONS.TRANSACTION.READ, PERMISSIONS.TRANSACTION.READ_OWN_TRANSACTIONS]
  })]
})

useAdminBreadcrumb('mdi-security', [{
  title: 'Transactions',
  href: '/admin/transaction-list'
}])

const { data: currentUserData } = useAuth()
const currentUser = currentUserData.value as UserI

const transactionStore = useTransactionStore()
const snackbarStore = useSnackbarStore()
const {
  fetchTransactions,
  exportTransactions,
  reValidateTransaction,
  authorizeToReValidateTransaction
} = transactionStore
const { showSuccessSnackbar } = snackbarStore

const itemsPerPage = ref(10)
const page = ref(1)
const transactions = ref<TransactionI[]>([])
const transactionsLoading = ref(false)
const filter = ref<Record<string, string | boolean | number>>({
  success: false
})
const totalItems = ref(0)
const revalidateTransactionLoadings = ref<boolean[]>([])
const authorizeRevalidationTransactionLoadings = ref<boolean[]>([])

// eslint-disable-next-line max-len
const actionInLoading = computed(() => revalidateTransactionLoadings.value.some(loading => loading) ||
  authorizeRevalidationTransactionLoadings.value.some(loading => loading))

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
    title: 'Performed by',
    key: 'user',
    sortable: false
  },
  {
    title: 'Validated by',
    key: 'checker',
    sortable: false
  },
  {
    title: 'Amount',
    key: 'amount',
    sortable: false
  },
  {
    title: 'Branch',
    key: 'branch',
    sortable: false
  },
  {
    title: 'Status',
    key: 'success',
    sortable: false
  },
  {
    title: 'Actions',
    key: 'actions',
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
  showSuccessSnackbar('The file has been downloaded')
}

function handleExportTransactions () {
  exportTransactions(filter.value)
}

function onRevalidateTransaction (transaction: TransactionI) {
  revalidateTransactionLoadings.value[transaction.id] = true
  reValidateTransaction(transaction.id)
    .finally(() => {
      revalidateTransactionLoadings.value[transaction.id] = false
      loadTransactions()
    })
}

function onAuthorizeToRevalidateTransaction (transaction: TransactionI) {
  revalidateTransactionLoadings.value[transaction.id] = true
  authorizeToReValidateTransaction(transaction.id)
    .finally(() => {
      revalidateTransactionLoadings.value[transaction.id] = false
      loadTransactions()
    })
}

loadTransactions()
</script>
