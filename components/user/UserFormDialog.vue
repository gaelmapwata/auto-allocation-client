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
import { BranchI } from '~/types/branch'
import { useBranchStore } from '~/stores/branch'

const snackbarStore = useSnackbarStore()
const roleStore = useRoleStore()
const userStore = useUserStore()
const branchStore = useBranchStore()
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
const { fetchAllBranchesByLoggedBank } = branchStore

const form = ref<typeof Form>()
const actionLoading = ref(false)
const branchLoading = ref(false)
const branches = ref<BranchI[]>([])

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
      roleId: props.entity?.roles?.[0]?.id || null,
      branchId: props.entity?.branch?.id || null
    }
  }
  return {}
})

const fields = computed(() => [
  { name: 'email', placeholder: 'Please enter the email', label: 'Email', type: 'text' },
  { name: 'validateMaxAmountCDF', label: 'Maximum validation amount (CDF)', type: 'number' },
  { name: 'validateMaxAmountUSD', label: 'Maximum validation amount (USD)', type: 'number' },
  {
    name: 'roleId',
    placeholder: 'Please select role',
    label: 'Role',
    type: 'select',
    items: roles.value,
    loading: roleLoading.value
  },
  {
    name: 'branchId',
    placeholder: 'Please select branch',
    label: 'Branch',
    type: 'select',
    items: branches.value,
    loading: branchLoading.value,
    itemTitle: 'label'
  }
])

const formSchema = object({
  email: string()
    .max(255)
    .required('Please fill in the e-mail')
    .email('Please enter a valid email address'),
  branchId: number()
    .required('Please select a branch'),
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

function fetchAllBranches () {
  branchLoading.value = true
  fetchAllBranchesByLoggedBank()
    .then((data) => {
      branches.value = data
    })
    .catch(() => {
      showErrorSnackbar('Failed to fetch branches')
    })
    .finally(() => {
      branchLoading.value = false
    })
}

fetchRoles()
fetchAllBranches()
</script>
