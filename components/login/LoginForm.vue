<template>
  <div class="login-form-container">
    <h1>UBA AUTO ALLOCATION</h1>
    <h2 class="text-primary">
      AUTHENTIFICATION
    </h2>

    <hr>

    <Form class="mt-10" :validation-schema="loginSchema" @submit="(onSubmit as any)">
      <p class="mb-6">
        Please enter your login details to connect
      </p>

      <div class="mb-2">
        <Field v-slot="{ field, errorMessage }" name="email">
          <v-text-field
            v-bind="field"
            v-model="email"
            :error-messages="errorMessage"
            placeholder="Enter your e-mail"
            prepend-inner-icon="mdi-email-outline"
            variant="solo-filled"
            rounded
            flat
          />
        </Field>
      </div>

      <div class="mb-2">
        <Field v-slot="{ field, errorMessage }" name="password">
          <v-text-field
            v-bind="field"
            :append-inner-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="passwordVisible ? 'text' : 'password'"
            :error-messages="errorMessage"
            placeholder="Enter your password"
            prepend-inner-icon="mdi-lock-outline"
            variant="solo-filled"
            rounded
            flat
            @click:append-inner="passwordVisible = !passwordVisible"
          />
        </Field>
      </div>

      <v-btn
        :loading="loading"
        :disabled="loading"
        append-icon="mdi-arrow-top-right"
        color="primary"
        size="large"
        type="submit"
        block
        rounded
      >
        <span class="text-none" style="letter-spacing: 0;">Login</span>
      </v-btn>
    </Form>
  </div>

  <LoginOtpDialog v-model="showOtpForm" :token="token" />
</template>

<script lang="ts" setup>
import { Form, Field } from 'vee-validate'
import { object, string } from 'yup'
import { useSnackbarStore } from '@/stores/snackbar'
import { useAuthStore } from '@/stores/auth'

interface FormValueI {
  email: string;
  password: string;
}

const authStore = useAuthStore()
const snackbarStore = useSnackbarStore()

const passwordVisible = ref(false)
const loading = ref(false)
const showOtpForm = ref(false)
const email = ref()
const token = ref()
const { showErrorSnackbar } = snackbarStore

const loginSchema = object({
  email: string()
    .email('Please enter a valid email address')
    .required('Please enter an email address'),
  password: string().required('Please enter a password')
})

function onSubmit (values: FormValueI) {
  authStore.signin(values)
    .then(({ error, data }) => {
      loading.value = false
      if (error.value) {
        if (error.value.statusCode === 401) {
          showErrorSnackbar(error.value.data.msg || 'Incorrect login')
        }
      } else {
        token.value = data.value.token
        showOtpForm.value = true
      }
    })
}

</script>

<style lang="scss">
.login-form-container{
  padding: 40px;
  h1 {
    font-size: 12px;
    font-weight: 200;
  }
  h2 {
    font-size: 24px;
  }
  hr {
    background-color: $primary;
    height: 10px;
    width: 50px;
    border: none;
    margin: 10px 0;
    position: relative;
    &:after {
      content: "";
      display: block;
      background-color: $primary-dark;
      position: absolute;
      right: -12px;
      width: 10px;
      height: 100%;
    }
  }
}
</style>
