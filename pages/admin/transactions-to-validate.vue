<template>
  <div class="page-container">
    <v-card rounded="xl" elevation="0" style="overflow: visible; position: relative; z-index: 2;">
      <v-card-text>
        <TransactionFiltre
          v-model="filter"
          :show-success-filter="false"
          @filter="handleFilter()"
        />
      </v-card-text>
    </v-card>

    <v-card :loading="transactionsLoading" class="mt-2" rounded="xl" elevation="0">
      <v-card-text>
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :headers="(headers as any)"
          :items-length="totalItems"
          :items="transactions"
          :loading="transactionsLoading"
          item-value="id"
          items-per-page-text="Items per page"
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
          <template #[`item.amount`]="{ item }">
            {{ formatters.formatPrice(item.amount) }} {{ item.currency }}
          </template>
          <template #[`item.actions`]="{ item }">
            <v-btn
              v-if="userHasOneOfPermissions(currentUser, [PERMISSIONS.TRANSACTION.VALIDATE])"
              :disabled="confirmTransactionLoading || !currentUserCanValidateTransaction(item)"
              elevation="0"
              width="150"
              rounded="xl"
              append-icon="mdi-check"
              color="green"
              @click="showConfirmTransactionValidationDialog(item)"
            >
              <span class="text-none">Valider</span>
            </v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <CommonConfirmDialog
      v-model="confirmTransactionDialogVisible"
      :text="textConfirmDeletion"
      action-icon="mdi-check"
      action-text="Confirm"
      @confirm="onConfirmTransactionValidation"
    />
  </div>
</template>

<script lang="ts" setup>
import { formatters } from '@/utilities/formatter.util'
import { TransactionI } from '@/types/transaction'
import { useTransactionStore } from '@/stores/transaction'
import { PERMISSIONS, shouldHaveOneOfPermissions, userHasOneOfPermissions } from '~/utilities/auth.util'
import { UserI } from '~/types/user'
import { CURRENCIES } from '~/utilities/variables.util'

definePageMeta({
  layout: 'admin',
  middleware: [(_, __, next) => shouldHaveOneOfPermissions({
    next, permissions: [PERMISSIONS.TRANSACTION.READ_TRANSACTIONS_TO_VALIDATE]
  })]
})

useAdminBreadcrumb('mdi-security', [{
  title: 'Transactions to be validated',
  href: '/admin/transaction-to-validate'
}])

const { data: currentUserData } = useAuth()
const currentUser = currentUserData.value as UserI

const transactionStore = useTransactionStore()
const { fetchTransactionsToValidate, validateTransaction } = transactionStore

const itemsPerPage = ref(10)
const page = ref(1)
const transactions = ref<TransactionI[]>([])
const transactionsLoading = ref(false)
const filter = ref<Record<string, string | boolean | number>>({})
const totalItems = ref(0)
const confirmTransactionDialogVisible = ref(false)
const confirmTransactionLoading = ref(false)
const transactionToValidate = ref<TransactionI>()

const textConfirmDeletion = computed(() => (transactionToValidate.value
  ? `Do you really want to confirm the
    ${parseFloat((transactionToValidate.value?.amount as number).toString())} ${transactionToValidate.value?.currency}
    of account ${transactionToValidate.value?.drAcctNum} to the account ${transactionToValidate.value?.crAcctNum}`
  : 'No transactions selected'))

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
    title: 'Account to be debited',
    key: 'drAcctNum',
    sortable: false
  },
  {
    title: 'Account to be credited',
    key: 'crAcctNum',
    sortable: false
  },
  {
    title: 'Amount',
    key: 'amount',
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

function showConfirmTransactionValidationDialog (transaction: TransactionI) {
  transactionToValidate.value = transaction
  confirmTransactionDialogVisible.value = true
}

function onConfirmTransactionValidation () {
  confirmTransactionLoading.value = true
  validateTransaction(transactionToValidate.value?.id as number)
    .finally(() => {
      confirmTransactionLoading.value = false
      loadTransactions()
    })
}

function currentUserCanValidateTransaction (transaction: TransactionI) {
  if (transaction.currency === CURRENCIES.CDF && currentUser.validateMaxAmountCDF) {
    return transaction.amount <= currentUser.validateMaxAmountCDF
  }
  if (transaction.currency === CURRENCIES.USD && currentUser.validateMaxAmountUSD) {
    return transaction.amount <= currentUser.validateMaxAmountUSD
  }
  return true
}

async function loadTransactions () {
  transactionsLoading.value = true
  const { data, total } = await fetchTransactionsToValidate(
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

loadTransactions()
</script>
