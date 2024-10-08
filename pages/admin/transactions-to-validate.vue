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
              :disabled="actionInLoading || !currentUserCanValidateTransaction(item)"
              :loading="confirmTransactionLoadings[item.id]"
              elevation="0"
              width="150"
              rounded="xl"
              append-icon="mdi-check"
              color="green"
              @click="showConfirmTransactionValidationDialog(item)"
            >
              <span class="text-none">Validate</span>
            </v-btn>

            <v-btn
              v-if="userHasOneOfPermissions(currentUser, [PERMISSIONS.TRANSACTION.VALIDATE])"
              :disabled="actionInLoading || !currentUserCanValidateTransaction(item)"
              :loading="cancelTransactionLoadings[item.id]"
              elevation="0"
              width="150"
              rounded="xl"
              append-icon="mdi-check"
              color="gray"
              @click="showConfirmCancelTransactionDialog(item)"
            >
              <span class="text-none">Cancel</span>
            </v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <CommonConfirmDialog
      v-model="confirmTransactionDialogVisible"
      :text="textConfirmTransaction"
      action-icon="mdi-check"
      action-text="Confirm"
      @confirm="onConfirmTransactionValidation"
    />

    <CommonConfirmDialog
      v-model="cancelTransactionDialogVisible"
      :text="textConfirmCancelTransaction"
      action-icon="mdi-check"
      action-text="Confirm"
      @confirm="onCancelTransaction"
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
  title: 'Transactions to be validate',
  href: '/admin/transaction-to-validate'
}])

const { data: currentUserData } = useAuth()
const currentUser = currentUserData.value as UserI

const transactionStore = useTransactionStore()
const { fetchTransactionsToValidate, validateTransaction, cancelTransaction } = transactionStore

const itemsPerPage = ref(10)
const page = ref(1)
const transactions = ref<TransactionI[]>([])
const transactionsLoading = ref(false)
const filter = ref<Record<string, string | boolean | number>>({})
const totalItems = ref(0)
const confirmTransactionDialogVisible = ref(false)
const cancelTransactionDialogVisible = ref(false)
const confirmTransactionLoadings = ref<boolean[]>([])
const cancelTransactionLoadings = ref<boolean[]>([])
const transactionToValidate = ref<TransactionI>()

const textConfirmTransaction = computed(() => (transactionToValidate.value
  ? `Do you really want to confirm the
    ${parseFloat((transactionToValidate.value?.amount as number).toString())} ${transactionToValidate.value?.currency}
    of account ${transactionToValidate.value?.drAcctNum} to the account ${transactionToValidate.value?.crAcctNum}`
  : 'No transactions selected'))

const textConfirmCancelTransaction = computed(() => (transactionToValidate.value
  ? `Do you really want to cancel the
    ${parseFloat((transactionToValidate.value?.amount as number).toString())} ${transactionToValidate.value?.currency}
    of account ${transactionToValidate.value?.drAcctNum} to the account ${transactionToValidate.value?.crAcctNum}`
  : 'No transactions selected'))

const actionInLoading = computed(() => confirmTransactionLoadings.value.some(loading => loading) ||
  cancelTransactionLoadings.value.some(loading => loading))

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

function showConfirmCancelTransactionDialog (transaction: TransactionI) {
  transactionToValidate.value = transaction
  cancelTransactionDialogVisible.value = true
}

function onConfirmTransactionValidation () {
  if (!transactionToValidate.value) { return }

  const transactionId = transactionToValidate.value.id as number

  confirmTransactionLoadings.value[transactionId] = true
  validateTransaction(transactionId)
    .finally(() => {
      confirmTransactionLoadings.value[transactionId] = false
      loadTransactions()
    })
}

function onCancelTransaction () {
  if (!transactionToValidate.value) { return }

  const transactionId = transactionToValidate.value.id as number

  cancelTransactionLoadings.value[transactionId] = true
  cancelTransaction(transactionId)
    .finally(() => {
      cancelTransactionLoadings.value[transactionId] = false
      loadTransactions()
    })
}

function currentUserCanValidateTransaction (transaction: TransactionI) {
  if (transaction.currency === CURRENCIES.CDF && currentUser.validateMaxAmountCDF) {
    return (+transaction.amount) <= (+currentUser.validateMaxAmountCDF)
  }
  if (transaction.currency === CURRENCIES.USD && currentUser.validateMaxAmountUSD) {
    return (+transaction.amount) <= (+currentUser.validateMaxAmountUSD)
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
