<template>
  <CommonDialog
    v-model="dialog"
    :title="dialogTitle"
    :submit="onSubmit"
    :action-loading="actionLoading"
    width="400"
    action-text="Confirm"
  >
    <Form
      ref="form"
      :validation-schema="formSchema"
      :initial-values="initialValues"
      @submit="onSubmit"
    >
      <DynamicFields :fields="fields" />
    </Form>
  </CommonDialog>
</template>

<script lang="ts" setup>
import { number, object, string } from 'yup'
import { Form } from 'vee-validate'
import { useSnackbarStore } from '@/stores/snackbar'
import { useRoleStore } from '@/stores/role'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { UserI } from '~/types/user'
import { RoleI } from '~/types/role'

const snackbarStore = useSnackbarStore()
const roleStore = useRoleStore()
const userStore = useUserStore()
const { loading: roleLoading, roles } = storeToRefs(roleStore)

const props = defineProps({
  modelValue: Boolean,
  action: { type: String, default: '' },
  entity: { type: Object as PropType<UserI>, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue', 'created', 'updated'])

const { showErrorSnackbar } = snackbarStore
const { fetchRoles } = roleStore
const { updateUser, storeUser } = userStore

const form = ref<typeof Form>()
const actionLoading = ref(false)

const dialogTitle = computed(() => (props.action === 'create' ? 'User created' : 'User updated'))
const dialog = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    emit('update:modelValue', value)
  }
})
const initialValues = computed(() => {
  if (props.action === 'update') {
    return {
      ...props.entity,
      roleId: props.entity?.roles?.[0]?.id || null
    }
  }
  return {}
})

const fields = computed(() => [
  { name: 'email', placeholder: 'Please enter the email', label: 'Email', type: 'text' },
  { name: 'accountNumberCDF', placeholder: 'accountNumberCDF', label: 'accountNumberCDF', type: 'text' },
  { name: 'accountNumberUSD', placeholder: 'accountNumberUSD', label: 'accountNumberUSD', type: 'text' },
  { name: 'validateMaxAmountCDF', label: 'Maximum validation amount (CDF)', type: 'number' },
  { name: 'validateMaxAmountUSD', label: 'Maximum validation amount (USD)', type: 'number' },
  {
    name: 'roleId',
    placeholder: 'Please select role',
    label: 'Role',
    type: 'select',
    items: roles.value,
    loading: roleLoading.value
  }
])

const formSchema = object({
  email: string()
    .max(255)
    .required('Please fill in the e-mail')
    .email('Please enter a valid email address'),
  validateMaxAmountCDF: number()
    .nullable()
    .transform((value: unknown, originalValue: unknown) => (originalValue === '' ? null : value)),
  validateMaxAmountUSD: number()
    .nullable()
    .transform((value: unknown, originalValue: unknown) => (originalValue === '' ? null : value))
})

async function onSubmit () {
  if (form.value) {
    const { valid } = await form.value.validate()
    if (valid) {
      actionLoading.value = true
      const userPayload = form.value.getValues()
      if (userPayload.validateMaxAmountCDF === '') {
        userPayload.validateMaxAmountCDF = null
      }
      if (userPayload.validateMaxAmountUSD === '') {
        userPayload.validateMaxAmountUSD = null
      }

      if (props.action === 'create') {
        await storeUser(userPayload)
        emit('created')
      } else if (props.action === 'update') {
        await updateUser(userPayload)
        emit('updated')
      }
      actionLoading.value = false
      form.value.resetForm()
      dialog.value = false
    } else {
      showErrorSnackbar('Incorrect form')
    }
  }
}

fetchRoles()
</script>
