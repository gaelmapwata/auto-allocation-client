<template>
  <CommonDialog
    v-model="dialog"
    title="Assigning permissions"
    :submit="onSubmit"
    :action-loading="actionLoading"
    min-width="600"
    action-text="Confirm"
  >
    <div v-for="ressource in ressources" :key="ressource.id">
      <p class="text-capitalize">
        {{ ressource.name }}
      </p>
      <v-chip-group>
        <v-chip
          v-for="permission in ressource.permissions"
          :key="permission.id"
          :class="{ active: permissions.find(p => p.id === permission.id) }"
          :prepend-icon="permissions.find(p => p.id === permission.id) ? 'mdi-check-circle' : null"
          @click="togglePermission(permission)"
        >
          {{ permission.name }}
        </v-chip>
      </v-chip-group>

      <v-divider class="my-2" />
    </div>
  </CommonDialog>
</template>

<script lang="ts" setup>
import { useRoleStore } from '@/stores/role'
import { storeToRefs } from 'pinia'
import { useRessourceStore } from '@/stores/ressource'
import { PermissionI } from '~/types/permission'
import { RoleI } from '~/types/role'

const roleStore = useRoleStore()
const ressourceStore = useRessourceStore()

const props = defineProps({
  modelValue: Boolean,
  role: { type: Object as PropType<RoleI>, required: true }
})
const emit = defineEmits(['update:modelValue'])
const { updatePermissions } = roleStore
const { ressources } = storeToRefs(ressourceStore)
const { fetchRessources } = ressourceStore

const actionLoading = ref(false)
const permissions = ref<PermissionI[]>(props.role?.permissions ?? [])

watch(() => props.role, (newRole) => {
  permissions.value = newRole.permissions || []
})

const dialog = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    emit('update:modelValue', value)
  }
})

async function onSubmit () {
  actionLoading.value = true
  await updatePermissions(props.role.id, permissions.value.map(p => p.id))
  actionLoading.value = false
  dialog.value = false
}

function togglePermission (permission: PermissionI) {
  const index = permissions.value.findIndex(p => p.id === permission.id)
  if (index !== -1) {
    permissions.value.splice(index, 1)
  } else {
    permissions.value.push(permission)
  }
}

fetchRessources()
</script>

<style lang="scss">
  .v-chip-group .v-chip.active {
    background-color: $primary;
    color: white;
  }
</style>
