<template>
  <v-table>
    <tbody>
      <tr>
        <td>First Name</td>
        <td>{{ kycDetails.first_name }}</td>
      </tr>
      <tr>
        <td>Name</td>
        <td>{{ kycDetails.last_name }}</td>
      </tr>
      <tr>
        <td>Grade</td>
        <td>{{ kycDetails.grade }}</td>
      </tr>
      <tr>
        <td>MSISDN</td>
        <td>{{ kycDetails.msisdn }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script lang="ts" setup>
import { CheckKYCResponseI } from '~/types/airtel-money'

defineProps({
  kycDetails: { type: Object as PropType<CheckKYCResponseI>, required: true }
})
</script>
