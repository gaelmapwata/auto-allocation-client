import { Value } from 'sass';
<template>
  <div>
    <p class="text-center mb-2">
      ~Filter~
    </p>

    <v-row justify="center">
      <v-col cols="12" sm="6" md="4" class="pb-0">
        <v-text-field
          v-model="filter.msisdn"
          label="Search by MSISDN"
          placeholder="MSISDN"
          variant="solo-filled"
          density="compact"
          hide-details
          flat
          rounded
          clearable
        />
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-select
          v-model="filter.currency"
          :items="['USD', 'CDF']"
          label="Currencies"
          variant="solo-filled"
          density="compact"
          hide-details
          flat
          rounded
          clearable
        />
      </v-col>

      <v-col cols="12" class="pa-0" />

      <v-col cols="12" sm="6" md="4" class="d-flex align-center">
        <CommonDateRangePicker v-model="filter.date" />
      </v-col>

      <v-col v-if="showSuccessFilter" cols="12" sm="6" md="4" class="d-flex align-center">
        <v-switch
          v-model="filter.success"
          label="Only successful transactions"
          color="primary"
          hide-details
        />
      </v-col>

      <v-col cols="12" class="text-center">
        <v-btn
          color="primary"
          elevation="0"
          width="150"
          rounded="xl"
          append-icon="mdi-tune-variant"
          class="mx-1 mb-2"
          @click="handleFilter()"
        >
          <span class="text-none">Filter</span>
        </v-btn>

        <v-btn
          elevation="0"
          width="150"
          rounded="xl"
          class="mx-1 mb-2"
          variant="tonal"
          append-icon="mdi-refresh"
          @click="resetFilter()"
        >
          <span class="text-none">Reset</span>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>

const props = defineProps({
  modelValue: { type: Object, required: true },
  showSuccessFilter: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'filter'])

const filter = computed({
  get () {
    return props.modelValue
  },
  set (newValue) {
    emit('update:modelValue', newValue)
  }
})

function resetFilter () {
  filter.value = {}
  emit('filter', filter.value)
}

function handleFilter () {
  if (filter.value.date) {
    [filter.value.startDate, filter.value.endDate] = filter.value.date
    filter.value.endDate = filter.value.endDate ?? filter.value.startDate
  } else {
    delete filter.value.startDate
    delete filter.value.endDate
  }

  emit('filter', filter.value)
}
</script>
