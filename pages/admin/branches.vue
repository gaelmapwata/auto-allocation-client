<template>
  <div class="page-container">
    <div class="d-flex mb-4 justify-end">
      <v-btn
        v-if="userHasOneOfPermissions(currentUser, [PERMISSIONS.BRANCH.CREATE])"
        prepend-icon="mdi-plus"
        color="primary"
        rounded="xl"
        @click="onAddBranch()"
      >
        <span class="text-none">Add</span>
      </v-btn>
      <v-btn
        v-if="userHasOneOfPermissions(currentUser, [PERMISSIONS.BRANCH.UPDATE])"
        :disabled="!selectedBranch"
        prepend-icon="mdi-pencil"
        color="white"
        rounded="xl"
        class="ml-2"
        @click="onEditBranch()"
      >
        <span class="text-none">Update</span>
      </v-btn>
      <v-btn
        v-if="userHasOneOfPermissions(currentUser, [PERMISSIONS.BRANCH.DELETE])"
        :disabled="!selectedBranch || deletionInLoading"
        :loading="deletionInLoading"
        prepend-icon="mdi-delete"
        color="white"
        rounded="xl"
        class="ml-2"
        @click="onDeleteBranch()"
      >
        <span class="text-none">Delete</span>
      </v-btn>
    </div>

    <v-card rounded="xl" elevation="0">
      <template #text>
        <v-data-table-server
          v-model="selectedBranches"
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :items-length="totalItems"
          :headers="(headers as any)"
          :items="branches"
          :loading="branchesLoading"
          items-per-page-text="Items per page"
          item-value="id"
          select-strategy="single"
          show-select
          return-object
          @update:options="loadBranches"
        >
          <template #[`item.index`]="{ index }">
            {{ (itemsPerPage * (page - 1)) + index + 1 }}
          </template>
        </v-data-table-server>
      </template>
    </v-card>

    <BranchFormDialog
      v-model="branchFormDialogVisible"
      :action="branchFormDialogAction"
      :entity="selectedBranch || undefined"
      @created="refreshBranches()"
      @updated="refreshBranches()"
    />
    <CommonConfirmDialog
      v-model="confirmDialogVisible"
      :text="textConfirmDeletion"
      @confirm="onConfirmDeletion"
    />
  </div>
</template>

<script lang="ts" setup>
import { useBranchStore } from '@/stores/branch'
import { PERMISSIONS, shouldHaveOneOfPermissions, userHasOneOfPermissions } from '@/utilities/auth.util'
import { BranchI } from '~/types/branch'
import { UserI } from '~/types/user'

definePageMeta({
  layout: 'admin',
  middleware: [(_, __, next) => shouldHaveOneOfPermissions({
    next, permissions: [PERMISSIONS.BRANCH.READ]
  })]
})

useAdminBreadcrumb('mdi-domain', [{
  title: 'Branches',
  href: '/admin/branches'
}])

const { data: currentUserData } = useAuth()
const currentUser = currentUserData.value as UserI

const branchStore = useBranchStore()
const { fetchBranchesByLoggedBank, deleteBranch } = branchStore

const itemsPerPage = ref(10)
const page = ref(1)
const selectedBranches = ref([])
const branches = ref<BranchI[]>([])
const totalItems = ref(0)
const branchFormDialogVisible = ref(false)
const branchFormDialogAction = ref<string | undefined>(undefined)
const confirmDialogVisible = ref(false)
const deletionInLoading = ref(false)
const branchesLoading = ref(false)

const textConfirmDeletion = computed(
  () => `Do you really want to delete the branch <strong>"${selectedBranch.value?.label}"</strong> ?`
)

const selectedBranch = computed<BranchI | null>(
  () => (selectedBranches.value.length > 0 ? selectedBranches.value[0] : null)
)

const headers = [
  {
    title: '#',
    align: 'start',
    sortable: false,
    key: 'index'
  },
  {
    title: 'Label',
    key: 'label'
  },
  {
    title: 'Sol ID',
    key: 'solId'
  }
]

function onEditBranch () {
  branchFormDialogAction.value = 'update'
  branchFormDialogVisible.value = true
}

function onAddBranch () {
  branchFormDialogAction.value = 'create'
  branchFormDialogVisible.value = true
}

function onDeleteBranch () {
  confirmDialogVisible.value = true
}

async function onConfirmDeletion () {
  if (selectedBranch.value) {
    deletionInLoading.value = true
    await deleteBranch(selectedBranch.value.id)
    refreshBranches()
    deletionInLoading.value = false
  }
}

function refreshBranches () {
  loadBranches({
    page: page.value,
    itemsPerPage: itemsPerPage.value
  })
}

async function loadBranches (payload: { page: number, itemsPerPage: number }) {
  branchesLoading.value = true
  const { data, total } = await fetchBranchesByLoggedBank(
    { page: payload.page, limit: payload.itemsPerPage }
  )
  branches.value = data
  totalItems.value = total
  branchesLoading.value = false
}
</script>
