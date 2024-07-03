<template>
  <VueDatePicker
    v-model="date"
    :highlight-week-days="[0, 6]"
    :max-date="new Date()"
    :enable-time-picker="false"
    :month-change-on-scroll="false"
    :format-locale="fr"
    format="dd/MM/yyyy"
    placeholder="Select a date range"
    class="date-range-picker"
    model-type="yyyy/MM/dd"
    range
    clearable
  />
</template>

<script lang="ts" setup>

import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { fr } from 'date-fns/locale'

const props = defineProps({
  modelValue: { type: Array<string>, default: () => ([]) }
})

const emit = defineEmits(['update:modelValue'])

const date = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    emit('update:modelValue', value)
  }
})
</script>

<style lang="scss">
.date-range-picker input {
  background-color: $bg-input;
  border: none;
  padding: 12px 35px;
  border-radius: 25px;
}
</style>
