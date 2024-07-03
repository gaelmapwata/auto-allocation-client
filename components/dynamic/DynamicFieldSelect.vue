<template>
  <v-select
    v-model="value"
    v-bind="field"
    :value="modelValue"
    :placeholder="placeholder"
    :label="label"
    :error-messages="errorMessages"
    :multiple="multiple"
    :items="filteredItems"
    :item-title="itemTitle"
    :item-value="itemValue"
    :readonly="readOnly"
    variant="solo-filled"
    chips
    rounded
    flat
  >
    <template v-if="selectFilter" #prepend-item>
      <v-text-field v-model="filter" placeholder="Search" />
    </template>

    <template v-if="itemSubtitle" #item="{ props: selectProps, item }">
      <v-list-item
        lines="3"
        v-bind="selectProps"
        :title="item?.raw[itemTitle]"
        :subtitle="item?.raw[itemSubtitle]"
      />
    </template>
  </v-select>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [String, Array, Number, null], required: true, default: null },
  multiple: Boolean,
  name: { type: String, required: true },
  placeholder: { type: String, default: '' },
  label: { type: String, default: '' },
  itemTitle: { type: String, default: 'name' },
  itemValue: { type: String, default: 'id' },
  itemSubtitle: { type: String, default: null },
  field: { type: Object, required: true },
  readOnly: { type: Boolean, default: false },
  selectFilter: { type: Boolean, default: false },
  errorMessages: { type: [Array, String], default: () => ([]) },
  items: { type: Array, default: () => ([]) }
})

const emit = defineEmits(['update:modelValue'])

const filter = ref('')

const value = computed({
  get () {
    return props.modelValue
  },
  set (newValue) {
    emit('update:modelValue', newValue)
  }
})

const filteredItems = computed(() => {
  if (props.itemTitle || props.itemSubtitle) {
    const regex = new RegExp(filter.value, 'i')
    return props.items
      .filter(item => (
        props.itemTitle && item[props.itemTitle] && item[props.itemTitle].toString().match(regex)
      ) || (
        props.itemSubtitle && item[props.itemSubtitle] && item[props.itemSubtitle].match(regex)
      ))
  }
  return props.items.slice()
})
</script>
