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
          title="Lancer le paiement"
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
              <div class="mx-auto my-5" style="max-width: 400px;">
                <Field v-slot="{ field, errorMessage }" name="msisdn">
                  <v-text-field
                    v-bind="field"
                    :error-messages="errorMessage"
                    variant="solo-filled"
                    label="Insérer le msisdn de l'agent"
                    placeholder="MSISDN"
                    rounded
                    flat
                  />
                </Field>
              </div>

              <div class="d-flex justify-end mb-4">
                <v-btn
                  variant="tonal"
                  type="submit"
                  rounded="xl"
                  :disabled="fetchKYCLoading"
                  :loading="fetchKYCLoading"
                >
                  <span class="text-none mr-2">Suivant</span>
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

              <div class="mx-auto my-5" style="max-width: 400px;">
                <Field v-slot="{ field, errorMessage }" name="amount">
                  <v-text-field
                    v-bind="field"
                    :error-messages="errorMessage"
                    variant="solo-filled"
                    label="Insérer le montant de la transaction"
                    placeholder="Montant"
                    type="number"
                    rounded
                    flat
                  />
                </Field>
              </div>

              <div class="mx-auto my-5" style="max-width: 400px;">
                <Field v-slot="{ field, errorMessage }" name="currency">
                  <v-select
                    v-bind="field"
                    :items="['USD', 'CDF']"
                    :error-messages="errorMessage"
                    variant="solo-filled"
                    label="Devise"
                    rounded
                    flat
                  />
                </Field>
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
                    <span class="text-none ml-2">Précédant</span>
                  </v-btn>
                </div>
                <div>
                  <v-btn
                    :loading="saveLoading"
                    :disabled="saveLoading"
                    color="primary"
                    type="submit"
                    rounded="xl"
                  >
                    <span class="text-none mr-2">Débuter le processus de paiement</span>
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
      action-text="Confirmer"
      @confirm="onConfirmTransaction"
    />
  </div>
</template>

<script lang="ts" setup>
import { number, object, string } from 'yup'
import { useAirtelMoneyStore } from '@/stores/airtel-money'
import { useTransactionStore } from '@/stores/transaction'
import { CheckKYCResponseI } from '~/types/airtel-money'

definePageMeta({
  layout: 'admin'
})

useAdminBreadcrumb('mdi-bank-plus', [{
  title: 'Ajout transaction Airtel Money',
  href: '/admin/ajout-transaction-airtel-money'
}])

const airtelMoneyStore = useAirtelMoneyStore()
const transactionStore = useTransactionStore()

const { checkKYCByMsisdn } = airtelMoneyStore
const { storeTransaction } = transactionStore

const stepOneSchema = object({
  msisdn: string().required()
})
const stepTransactionSchema = object({
  amount: number().required(),
  currency: string().required()
})

const step = ref('msisdn')
const msisdnFormRef = ref<any>(null)
const transactionFormRef = ref<any>(null)
const saveLoading = ref(false)
const fetchKYCLoading = ref(false)
const confirmDialogVisible = ref(false)
const kycDetails = ref<CheckKYCResponseI>()
const textConfirmDeletion = ref('')

function defineStep (stepName: string) {
  step.value = stepName
}

function handleMsisdnDefined (values: { msisdn: string }) {
  fetchKYCLoading.value = true
  checkKYCByMsisdn(values.msisdn)
    .then((value) => {
      kycDetails.value = value
      defineStep('saveTransaction')
    })
    .finally(() => { fetchKYCLoading.value = false })
}

function saveTransaction () {
  const { amount, currency } = transactionFormRef.value?.getValues() as {
      amount: number, currency: string
    }
  const msisdn = msisdnFormRef.value?.getValues().msisdn

  textConfirmDeletion.value = `Confirmer vous le virement
      de ${amount} ${currency}
      à ${msisdn} (${kycDetails.value?.first_name} ${kycDetails.value?.last_name})`

  confirmDialogVisible.value = true
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
      saveLoading.value = false
    })
    .catch(() => { saveLoading.value = false })
}
</script>
