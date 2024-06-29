<template>
  <CommonDialog
    v-model="dialog"
    :title="dialogTitle"
    :submit="onSubmit"
    :action-loading="actionLoading"
    width="400"
    action-text="Confirmer"
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

const dialogTitle = computed(() => (props.action === 'create' ? 'Création d\'un utilisateur' : 'Modifier l\' utilisateur'))
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
    return props.entity || {}
  }
  return {}
})

const fields = computed(() => [
  { name: 'email', placeholder: 'Veuillez entre l\' email', label: 'Email', type: 'text' },
  { name: 'validateMaxAmountCDF', label: 'Montant de validation maximum (CDF)', type: 'number' },
  { name: 'validateMaxAmountUSD', label: 'Montant de validation maximum (USD)', type: 'number' },
  {
    name: 'roles',
    placeholder: 'Veuillez sélectionner les roles',
    label: 'Roles',
    type: 'select-multiple',
    items: roles.value,
    loading: roleLoading.value
  }
])

const formSchema = object({
  email: string()
    .max(255)
    .required('Veuillez renseigner l\'e-mail')
    .email('Veuillez renseigner un email valide'),
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
        userPayload.roles = userPayload.roles.map((role: number | RoleI) => (typeof role === 'object' ? role.id : role))
        await updateUser(userPayload)
        emit('updated')
      }
      actionLoading.value = false
      form.value.resetForm()
      dialog.value = false
    } else {
      showErrorSnackbar('Formulaire incorrect')
    }
  }
}

fetchRoles()
</script>
