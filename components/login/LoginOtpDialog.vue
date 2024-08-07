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
        title="Confirm your Token"
      />
      <v-card-text class="pa-6">
        <div>
          use your physical or soft token a code to <strong class="text-primary">8 digits</strong>,
          Please enter it here.
        </div>

        <div class="mt-4">
          <v-otp-input
            v-model="otp"
            length="8"
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
          <span class="text-none" style="letter-spacing: 0;">Cancel</span>
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
          <span class="text-none" style="letter-spacing: 0;">Login</span>
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
  token: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const otp = ref<string>('')
const { showErrorSnackbar, showSuccessSnackbar } = snackbarStore

const { value: otpFieldValue, meta: otpFieldMeta } = useField('', string()
  .length(8, 'Please enter a 8-digit code')
  .matches(/^[0-9]+$/, 'Otp can only contain numbers')
  .required('Please enter the token'))

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
    token: props.token,
    otp: otpFieldValue.value
  }, { callbackUrl: '/admin' })
    .then(() => {
      showSuccessSnackbar('Connection successfully completed')
    })
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        // eslint-disable-next-line no-underscore-dangle
        showErrorSnackbar(error.response._data?.msg || 'Incorrect Otp')
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
