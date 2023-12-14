<template>
  <div class="page-container">
    <div class="d-flex mb-4 justify-end">
      <v-btn
        v-if="userHasOneOfPermissions(['ROLE:ADD'])"
        prepend-icon="mdi-plus"
        color="primary"
        rounded="xl"
        @click="onAddRole()"
      >
        <span class="text-none">Ajouter</span>
      </v-btn>
      <v-btn
        v-if="userHasOneOfPermissions(['ROLE:EDIT'])"
        :disabled="!selectedRole"
        prepend-icon="mdi-pencil"
        color="white"
        rounded="xl"
        class="ml-2"
        @click="onEditRole()"
      >
        <span class="text-none">Modifier</span>
      </v-btn>
      <v-btn
        v-if="userHasOneOfPermissions(['ROLE:DELETE'])"
        :disabled="!selectedRole || deletionInLoading"
        :loading="deletionInLoading"
        prepend-icon="mdi-delete"
        color="white"
        rounded="xl"
        class="ml-2"
        @click="onDeleteRole()"
      >
        <span class="text-none">Supprimer</span>
      </v-btn>
      <v-btn
        v-if="userHasOneOfPermissions(['ROLE:EDIT'])"
        :disabled="!selectedRole"
        prepend-icon="mdi-shield-account"
        color="white"
        rounded="xl"
        class="ml-2"
        @click="onUpdatePermissions()"
      >
        <span class="text-none">Mettre à jour les permissions</span>
      </v-btn>
    </div>

    <v-card rounded="xl" elevation="0">
      <template #text>
        <v-data-table
          v-model="selectedRoles"
          v-model:items-per-page="itemsPerPage"
          v-model:expanded="expanded"
          v-model:page="page"
          :headers="(headers as any)"
          :items="roles"
          :loading="roleLoading"
          items-per-page-text="Items par page"
          item-value="id"
          select-strategy="single"
          show-expand
          show-select
          return-object
        >
          <template #[`item.index`]="{ index }">
            {{ (itemsPerPage * (page - 1)) + index + 1 }}
          </template>

          <template #expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length" class="mb-3">
                <p class="mt-3">
                  Liste de permissions pour <strong>"{{ item.name }}"</strong>
                </p>

                <div v-if="!item.ressources || !item.ressources.length" class="mt-2 mb-4">
                  <v-chip>Aucune permission affectée</v-chip>
                </div>

                <template v-if="item.ressources">
                  <div
                    v-for="ressource in item.ressources"
                    :key="ressource.id"
                    class="d-flex align-center"
                  >
                    <v-chip
                      class="mr-2 bg-primary"
                      prepend-icon="mdi-shield-account"
                      color="white"
                    >
                      {{ ressource.name }}
                    </v-chip>
                    <v-chip-group>
                      <v-chip v-for="permission in ressource.permissions" :key="permission.id">
                        {{ permission.name }}
                      </v-chip>
                    </v-chip-group>
                  </div>
                </template>
              </td>
            </tr>
          </template>
        </v-data-table>
      </template>
    </v-card>
    <RoleFormDialog
      v-model="roleFormDialogVisible"
      :action="roleFormDialogAction"
      :entity="selectedRole || undefined"
    />
    <template v-if="selectedRole">
      <RolePermissionsFormDialog
        v-model="rolePermissionsDialogVisible"
        :role="selectedRole"
      />
    </template>
    <CommonConfirmDialog
      v-model="confirmDialogVisible"
      :text="textConfirmDeletion"
      @confirm="onConfirmDeletion"
    />
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useRoleStore } from '@/stores/role'
import { shouldHaveOneOfPermissions, userHasOneOfPermissions } from '@/utilities/auth.util'
import { RoleI } from '~/types/role'

definePageMeta({
  layout: 'admin',
  middleware: [(_, __, next) => shouldHaveOneOfPermissions({ next, permissions: ['ROLE:READ'] })]
})

const roleStore = useRoleStore()
const { loading: roleLoading, roles } = storeToRefs(roleStore)
const { fetchRoles, deleteRole } = roleStore

useAdminBreadcrumb('mdi-security', [{
  title: 'Roles',
  href: '/admin/roles'
}])

const expanded = ref([])
const itemsPerPage = ref(10)
const page = ref(1)
const selectedRoles = ref<RoleI[]>([])
const roleFormDialogVisible = ref(false)
const roleFormDialogAction = ref<string | undefined>(undefined)
const confirmDialogVisible = ref(false)
const deletionInLoading = ref(false)
const rolePermissionsDialogVisible = ref(false)

const textConfirmDeletion = computed(
  () => `Voulez-vous vraiment supprimer le role <strong>"${selectedRole.value?.name}"</strong> ?`
)

const selectedRole = computed<RoleI | null>(
  () => (selectedRoles.value.length > 0 ? selectedRoles.value[0] : null)
)

watch(roles, (newRoles) => {
  if (selectedRole.value) {
    const freshRole = newRoles.find(role => role.id === selectedRole.value?.id)
    selectedRoles.value = freshRole ? [freshRole] : []
  }
})

const headers = [
  {
    title: '#',
    align: 'start',
    sortable: false,
    key: 'index'
  },
  {
    title: 'Nom',
    key: 'name'
  }
]

fetchRoles()

function onEditRole () {
  roleFormDialogAction.value = 'update'
  roleFormDialogVisible.value = true
}

function onAddRole () {
  roleFormDialogAction.value = 'create'
  roleFormDialogVisible.value = true
}

function onDeleteRole () {
  confirmDialogVisible.value = true
}

async function onConfirmDeletion () {
  if (selectedRole.value) {
    deletionInLoading.value = true
    await deleteRole(selectedRole.value.id)
    deletionInLoading.value = false
  }
}

function onUpdatePermissions () {
  rolePermissionsDialogVisible.value = true
}
</script>
