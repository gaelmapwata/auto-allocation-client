<template>
  <v-dialog
    v-model="dialog"
    transition="dialog-bottom-transition"
    width="400"
    persistent
  >
    <v-card>
      <v-toolbar
        color="primary"
        title="Confirmer votre OTP"
      />
      <v-card-text class="pa-6">
        <div>
          Un email contenant un code à <strong class="text-primary">6 chiffres</strong>,
          d'une validité de <strong class="text-primary">5 minutes</strong>,
          vous a été transmis enfin de confirmer votre connexion,

          Veuillez la saisir ici s'il vous plait.
        </div>

        <div class="mt-4">
          <v-otp-input
            v-model="otp"
            type="number"
            @update:model-value="otpFieldValue = otp"
          />
        </div>
      </v-card-text>

      <v-card-actions class="justify-space-between px-6 pb-5">
        <v-btn
          rounded
          size="large"
          append-icon="mdi-close"
          class="px-5"
          @click="onCancel()"
        >
          <span class="text-none" style="letter-spacing: 0;">Annuler</span>
        </v-btn>
        <v-btn
          :loading="loading"
          :disabled="loading || !otpFieldMeta.valid"
          append-icon="mdi-lock-outline"
          size="large"
          class="px-5 bg-primary"
          rounded
          @click="onCheckOTP()"
        >
          <span class="text-none" style="letter-spacing: 0;">Connexion</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useField } from 'vee-validate'
import { string } from 'yup'
import { useSnackbarStore } from '@/stores/snackbar'

const { signIn } = useAuth()
const snackbarStore = useSnackbarStore()

const props = defineProps({
  modelValue: Boolean,
  email: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const otp = ref<string>('')
const { showErrorSnackbar, showSuccessSnackbar } = snackbarStore

const { value: otpFieldValue, meta: otpFieldMeta } = useField('', string()
  .length(6, 'Veuillez renseigner un code à 6 chiffres')
  .matches(/^[0-9]+$/, 'L\'Otp ne peut contenir que des chiffres')
  .required('Veuillez renseigner le OTP'))

const dialog = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    emit('update:modelValue', value)
  }
})

function onCheckOTP () {
  signIn({
    email: props.email,
    otp: otpFieldValue.value
  }, { callbackUrl: '/admin' })
    .then(() => {
      showSuccessSnackbar('Connexion effectuée avec succès')
    })
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        // eslint-disable-next-line no-underscore-dangle
        showErrorSnackbar(error.response._data?.msg || 'Otp incorrects')
      }
    })
}

function onCancel () {
  dialog.value = false
  otpFieldValue.value = ''
  otp.value = ''
}

</script>

<style lang="scss">
  .otp-field {
    input {
      text-align: center;
    }
  }
</style>
