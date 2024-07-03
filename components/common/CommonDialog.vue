<template>
  <v-dialog
    v-model="dialog"
    :width="width"
  >
    <v-card>
      <v-toolbar
        color="primary"
        :title="title"
      />
      <v-card-text class="pa-6 pb-4">
        <slot />
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
          :disabled="loading || !canSubmit"
          :append-icon="actionIcon"
          size="large"
          class="px-5 bg-primary"
          rounded
          @click="handleSubmit()"
        >
          <span class="text-none" style="letter-spacing: 0;">{{ actionText }}</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
const props = defineProps({
  modelValue: Boolean,
  width: { type: String, default: '600px' },
  title: { type: String, default: '' },
  actionText: { type: String, default: '' },
  actionIcon: { type: String, default: 'mdi-check' },
  canSubmit: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  submit: { type: Function, default: () => null }
})
const emit = defineEmits(['update:modelValue', 'cancel', 'submit'])

const dialog = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    emit('update:modelValue', value)
  }
})

function onCancel () {
  dialog.value = false
  emit('cancel')
}

function handleSubmit () {
  if (props.submit) {
    props.submit()
  }
  emit('submit')
}

</script>
