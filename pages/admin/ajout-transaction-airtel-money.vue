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
            <div v-if="kycDetails" class="mx-auto my-5">
              <KYCDetailView :kyc-details="kycDetails" />
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
                  @click="saveTransaction()"
                >
                  <span class="text-none mr-2">Débuter le processus de paiement</span>
                  <v-icon>mdi-arrow-top-right</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>
  </div>
</template>

<script lang="ts" setup>
import { object, string } from 'yup'
import { useAirtelMoneyStore } from '@/stores/airtel-money'
import { CheckKYCResponseI } from '~/types/airtel-money'

definePageMeta({
  layout: 'admin'
})

useAdminBreadcrumb('mdi-bank-plus', [{
  title: 'Ajout transaction Airtel Money',
  href: '/admin/ajout-transaction-airtel-money'
}])

const airtelMoneyStore = useAirtelMoneyStore()

const { checkKYCByMsisdn } = airtelMoneyStore

const stepOneSchema = object({
  msisdn: string().required()
})

const step = ref('msisdn')
const msisdnFormRef = ref(null)
const saveLoading = ref(false)
const fetchKYCLoading = ref(false)
const kycDetails = ref<CheckKYCResponseI>()

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
}
</script>
