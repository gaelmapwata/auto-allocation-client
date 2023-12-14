<template>
  <div class="page-container">
    <div class="d-flex mb-4 justify-end">
      <v-btn
        v-if="userHasOneOfPermissions(['USER:ADD'])"
        prepend-icon="mdi-plus"
        color="primary"
        rounded="xl"
        @click="onAddUser()"
      >
        <span class="text-none">Ajouter</span>
      </v-btn>
      <v-btn
        v-if="userHasOneOfPermissions(['USER:EDIT'])"
        :disabled="!selectedUser"
        prepend-icon="mdi-pencil"
        color="white"
        rounded="xl"
        class="ml-2"
        @click="onEditUser()"
      >
        <span class="text-none">Modifier</span>
      </v-btn>
      <v-btn
        v-if="userHasOneOfPermissions(['USER:DELETE'])"
        :disabled="!selectedUser || deletionInLoading"
        :loading="deletionInLoading"
        prepend-icon="mdi-delete"
        color="white"
        rounded="xl"
        class="ml-2"
        @click="onDeleteUser()"
      >
        <span class="text-none">Supprimer</span>
      </v-btn>
    </div>

    <v-card rounded="xl" elevation="0">
      <template #text>
        <v-data-table-server
          v-model="selectedUsers"
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :items-length="totalItems"
          :headers="(headers as any)"
          :items="users"
          :loading="usersLoading"
          items-per-page-text="Items par page"
          item-value="id"
          select-strategy="single"
          show-select
          return-object
          @update:options="loadUsers"
        >
          <template #[`item.index`]="{ index }">
            {{ (itemsPerPage * (page - 1)) + index + 1 }}
          </template>
          <template #[`item.roles`]="{ item }">
            <v-chip-group>
              <v-chip v-for="role in item.roles" :key="role.id">
                {{ role.name }}
              </v-chip>
            </v-chip-group>
          </template>
        </v-data-table-server>
      </template>
    </v-card>

    <UserFormDialog
      v-model="userFormDialogVisible"
      :action="userFormDialogAction"
      :entity="selectedUser || undefined"
      @created="refreshUsers()"
      @updated="refreshUsers()"
    />
    <CommonConfirmDialog
      v-model="confirmDialogVisible"
      :text="textConfirmDeletion"
      @confirm="onConfirmDeletion"
    />
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import { shouldHaveOneOfPermissions, userHasOneOfPermissions } from '@/utilities/auth.util'
import { UserI } from '~/types/user'

definePageMeta({
  layout: 'admin',
  middleware: [(_, __, next) => shouldHaveOneOfPermissions({ next, permissions: ['USER:READ'] })]

})

useAdminBreadcrumb('mdi-account-group', [{
  title: 'Utilisateurs',
  href: '/admin/users'
}])

const userStore = useUserStore()
const { fetchUsersWithPagination, deleteUser } = userStore

const itemsPerPage = ref(10)
const page = ref(1)
const selectedUsers = ref([])
const users = ref<UserI[]>([])
const totalItems = ref(0)
const userFormDialogVisible = ref(false)
const userFormDialogAction = ref<string | undefined>(undefined)
const confirmDialogVisible = ref(false)
const deletionInLoading = ref(false)
const usersLoading = ref(false)

const textConfirmDeletion = computed(
  () => `Voulez-vous vraiment supprimer l'utilisateur <strong>"${selectedUser.value?.email}"</strong> ?`
)

const selectedUser = computed<UserI | null>(
  () => (selectedUsers.value.length > 0 ? selectedUsers.value[0] : null)
)

const headers = [
  {
    title: '#',
    align: 'start',
    sortable: false,
    key: 'index'
  },
  {
    title: 'Email',
    key: 'email'
  },
  {
    title: 'Roles',
    key: 'roles'
  }
]

function onEditUser () {
  userFormDialogAction.value = 'update'
  userFormDialogVisible.value = true
}

function onAddUser () {
  userFormDialogAction.value = 'create'
  userFormDialogVisible.value = true
}

function onDeleteUser () {
  confirmDialogVisible.value = true
}

async function onConfirmDeletion () {
  if (selectedUser.value) {
    deletionInLoading.value = true
    await deleteUser(selectedUser.value.id)
    refreshUsers()
    deletionInLoading.value = false
  }
}

function refreshUsers () {
  loadUsers({
    page: page.value,
    itemsPerPage: itemsPerPage.value
  })
}

async function loadUsers (payload: { page: number, itemsPerPage: number }) {
  usersLoading.value = true
  const { data, total } = await fetchUsersWithPagination(
    { page: payload.page, limit: payload.itemsPerPage }
  )
  users.value = data
  totalItems.value = total
  usersLoading.value = false
}
</script>
