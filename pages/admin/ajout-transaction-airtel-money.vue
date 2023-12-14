<template>
  <div class="page-container">
    ADMINISTRATION
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'admin'
})

useAdminBreadcrumb('mdi-bank-plus', [{
  title: 'Ajout transaction Airtel Money',
  href: '/admin/ajout-transaction-airtel-money'
}])
</script>
