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
import { object, string } from 'yup'
import { Form } from 'vee-validate'
import { useSnackbarStore } from '@/stores/snackbar'
import { useBranchStore } from '@/stores/branch'
import { BranchI } from '~/types/branch'

const snackbarStore = useSnackbarStore()
const branchStore = useBranchStore()

const props = defineProps({
  modelValue: Boolean,
  action: { type: String, default: '' },
  entity: { type: Object as PropType<BranchI>, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue', 'created', 'updated'])

const { showErrorSnackbar } = snackbarStore
const { updateBranch, storeBranch } = branchStore

const form = ref<typeof Form>()
const actionLoading = ref(false)

const dialogTitle = computed(() => (props.action === 'create' ? 'Branch creation' : 'Branch Update'))
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

const fields = [
  { name: 'label', placeholder: 'Please enter the name', label: 'Label', type: 'text' },
  { name: 'solId', placeholder: 'Please enter the name', label: 'Sol ID', type: 'text' }
]
const formSchema = object({
  label: string()
    .max(255)
    .required('Please fill in the "label"'),
  solId: string()
    .max(255)
    .required('Please fill in the "solid"')
})

async function onSubmit () {
  if (form.value) {
    const { valid } = await form.value.validate()
    if (valid) {
      actionLoading.value = true
      if (props.action === 'create') {
        await storeBranch(form.value.getValues())
        emit('created')
      } else if (props.action === 'update') {
        await updateBranch(form.value.getValues())
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
</script>
