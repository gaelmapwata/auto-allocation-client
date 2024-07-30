<template>
  <div class="page-mini-container">
    <v-stepper
      v-model="step"
      alt-labels
      elevation="0"
      rounded="xl"
      hide-actions
    >
      <v-stepper-header>
        <v-stepper-item title="MSISDN" value="msisdn" icon="mdi-pencil" />

        <v-divider />

        <v-stepper-item
          title="Start payment"
          value="saveTransaction"
          icon="mdi-pencil"
        />
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item value="msisdn">
          <div class="mx-auto my-5" style="max-width: 800px;">
            <Form
              ref="msisdnFormRef"
              :validation-schema="stepOneSchema"
              class="mt-10"
              @submit="(handleMsisdnDefined as any)"
            >
              <div class="mx-auto" style="max-width: 400px;">
                <div class="my-5">
                  <Field v-slot="{ field, errorMessage }" name="msisdn">
                    <v-text-field
                      v-bind="field"
                      :error-messages="errorMessage"
                      variant="solo-filled"
                      label="Insert msisdn "
                      placeholder="MSISDN"
                      rounded
                      flat
                    />
                  </Field>
                </div>

                <div class="my-5">
                  <Field v-slot="{ field, errorMessage }" name="currency">
                    <v-select
                      v-model="currencyKYC"
                      v-bind="field"
                      :items="['USD', 'CDF']"
                      :error-messages="errorMessage"
                      variant="solo-filled"
                      label="Currency"
                      rounded
                      flat
                    />
                  </Field>
                </div>
              </div>

              <div class="d-flex justify-end mb-4">
                <v-btn
                  variant="tonal"
                  type="submit"
                  rounded="xl"
                  :disabled="fetchKYCLoading"
                  :loading="fetchKYCLoading"
                >
                  <span class="text-none mr-2">Next</span>
                  <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
              </div>
            </Form>
          </div>
        </v-stepper-window-item>

        <!-- eslint-disable-next-line vue/v-slot-style, vue/valid-v-slot -->
        <v-stepper-window-item value="saveTransaction">
          <div class="mx-auto my-5" style="max-width: 800px;">
            <Form
              ref="transactionFormRef"
              :validation-schema="stepTransactionSchema"
              class="mt-10"
              @submit="(saveTransaction as any)"
            >
              <div v-if="kycDetails" class="mx-auto my-5">
                <KYCDetailView :kyc-details="kycDetails" />
              </div>

              <div style="max-width: 400px;" class="mx-auto">
                <div class="my-5">
                  <Field v-slot="{ field, errorMessage }" name="amount">
                    <v-text-field
                      v-bind="field"
                      :error-messages="errorMessage"
                      variant="solo-filled"
                      label="Enter the amount of the transaction"
                      placeholder="Amount"
                      type="number"
                      rounded
                      flat
                    />
                  </Field>
                </div>

                <div class="my-5">
                  <Field v-slot="{ field, errorMessage }" name="currency">
                    <v-select
                      v-model="currencyKYC"
                      v-bind="field"
                      :items="['USD', 'CDF']"
                      :error-messages="errorMessage"
                      disabled
                      variant="solo-filled"
                      label="Currency"
                      rounded
                      flat
                    />
                  </Field>
                </div>

                <div v-if="canManuallySetAccountNumber" class="my-5">
                  <Field v-slot="{ field, errorMessage }" name="accountNumber">
                    <v-text-field
                      v-bind="field"
                      :error-messages="errorMessage"
                      variant="solo-filled"
                      label="Insert customer account number"
                      placeholder="Account number"
                      type="number"
                      rounded
                      flat
                    />
                  </Field>
                </div>

                <p v-if="kycDetails?.is_barred" class="text-center mb-4">
                  <v-icon class="mr-2" icon="mdi-alert" />
                  <span class="text-red-500">
                    This phone number has been banned
                  </span>
                </p>

                <p v-if="!isKYCGradeAuthorized" class="text-center mb-4">
                  <v-icon class="mr-2" icon="mdi-alert" />
                  <span class="text-red-500">
                    Grade not authorized
                  </span>
                </p>
              </div>

              <div class="d-flex justify-space-between mb-4">
                <div>
                  <v-btn
                    :disabled="saveLoading"
                    variant="tonal"
                    type="button"
                    rounded="xl"
                    @click="defineStep('msisdn')"
                  >
                    <v-icon>mdi-arrow-left</v-icon>
                    <span class="text-none ml-2">Previous</span>
                  </v-btn>
                </div>
                <div>
                  <v-btn
                    :loading="saveLoading"
                    :disabled="saveLoading || !isValidKYC"
                    color="primary"
                    type="submit"
                    rounded="xl"
                  >
                    <span class="text-none mr-2">Start the payment process</span>
                    <v-icon>mdi-arrow-top-right</v-icon>
                  </v-btn>
                </div>
              </div>
            </Form>
          </div>
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>

    <CommonConfirmDialog
      v-model="confirmDialogVisible"
      :text="textConfirmDeletion"
      action-icon="mdi-check"
      action-text="Confirm"
      @confirm="onConfirmTransaction"
    />
  </div>
</template>

<script lang="ts" setup>
import { number, object, string } from 'yup'
import { Form } from 'vee-validate'
import { useAirtelMoneyStore } from '@/stores/airtel-money'
import { useTransactionStore } from '@/stores/transaction'
import { useSnackbarStore } from '@/stores/snackbar'
import { CheckKYCResponseI } from '~/types/airtel-money'
import { PERMISSIONS, shouldHaveOneOfPermissions } from '~/utilities/auth.util'
import { AUTHORIZED_KYC_GRADE } from '~/utilities/variables.util'

definePageMeta({
  layout: 'admin',
  middleware: [(_, __, next) => shouldHaveOneOfPermissions({
    next, permissions: [PERMISSIONS.TRANSACTION.CREATE]
  })]
})

useAdminBreadcrumb('mdi-bank-plus', [{
  title: 'Add Airtel Money transaction',
  href: '/admin/ajout-transaction-airtel-money'
}])

const airtelMoneyStore = useAirtelMoneyStore()
const transactionStore = useTransactionStore()
const snackbarStore = useSnackbarStore()

const { showErrorSnackbar } = snackbarStore
const { checkKYCByMsisdn } = airtelMoneyStore
const { storeTransaction } = transactionStore

const canManuallySetAccountNumber = useUserHasOneOfPermissions([
  PERMISSIONS.TRANSACTION.CREATE_WITH_MANUAL_ACCOUNT
])

const stepOneSchema = object({
  msisdn: string().required(),
  currency: string().required()
})
const stepTransactionSchema = {
  amount: number().positive().required(),
  ...(
    canManuallySetAccountNumber
      ? {
          accountNumber: string()
            .required('Account number required')
            .matches(/^[0-9]*$/, 'Account number can only contain digits')
            .length(12, 'Account number must be exactly 12 digits long')
        }
      : {}
  )
}

const step = ref('msisdn')
const msisdnFormRef = ref<typeof Form>()
const transactionFormRef = ref<typeof Form>()
const saveLoading = ref(false)
const fetchKYCLoading = ref(false)
const confirmDialogVisible = ref(false)
const kycDetails = ref<CheckKYCResponseI>()
const textConfirmDeletion = ref('')
const currencyKYC = ref(null)

const isKYCGradeAuthorized = computed(() => kycDetails.value &&
  AUTHORIZED_KYC_GRADE.some(grade => grade.toLowerCase() === kycDetails.value?.grade.toLowerCase()))

const isValidKYC = computed(() => kycDetails.value &&
  !kycDetails.value.is_barred &&
  isKYCGradeAuthorized.value)

function defineStep (stepName: string) {
  step.value = stepName
}

function handleMsisdnDefined (values: { msisdn: string, currency: string }) {
  fetchKYCLoading.value = true
  checkKYCByMsisdn(values.msisdn, values.currency)
    .then((value) => {
      kycDetails.value = value
      defineStep('saveTransaction')
    })
    .finally(() => { fetchKYCLoading.value = false })
}

function saveTransaction () {
  if (!isValidKYC.value) {
    showErrorSnackbar('This msisdn is not authorized')
  } else {
    const currency = currencyKYC.value
    const { amount } = transactionFormRef.value?.getValues() as {
      amount: number
    }
    const msisdn = msisdnFormRef.value?.getValues().msisdn

    textConfirmDeletion.value = `Confirm the transfer
        of ${amount} ${currency}
        to ${msisdn} (${kycDetails.value?.first_name} ${kycDetails.value?.last_name})`

    confirmDialogVisible.value = true
  }
}

function onConfirmTransaction () {
  saveLoading.value = true
  storeTransaction({
    ...transactionFormRef.value?.getValues(),
    ...msisdnFormRef.value?.getValues(),
    lastName: kycDetails.value?.last_name,
    firstName: kycDetails.value?.first_name
  })
    .then(() => {
      defineStep('msisdn')
      msisdnFormRef.value?.resetForm()
      transactionFormRef.value?.resetForm()
      currencyKYC.value = null
      saveLoading.value = false
    })
    .catch(() => { saveLoading.value = false })
}
</script>
