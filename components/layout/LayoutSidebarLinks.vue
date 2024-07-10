<template>
  <template v-for="menuItem in groupedMenuItems" :key="menuItem.text">
    <div
      v-if="userHasOneOfPermissions(
        currentUser,
        menuItem.items?.flatMap(item => item?.permissions || [])
      )"
    >
      <small class="ml-3">{{ menuItem.text }}</small>
      <v-card density="compact" class="mt-1 mb-3" rounded="xl" elevation="0">
        <template #text>
          <v-list class="py-0">
            <template v-for="(item, index) in menuItem.items" :key="item.text">
              <template
                v-if="
                  userHasOneOfPermissions(currentUser, [
                    ...item.subItems?.flatMap(subItem => subItem?.permissions || []) || [],
                    ...item.permissions || []
                  ])"
              >
                <v-list-group :value="index">
                  <template #activator="{ props }">
                    <v-list-item
                      v-bind="props"
                      color="primary"
                      rounded="xl"
                      :to="item.to"
                      exact
                    >
                      <template #prepend>
                        <div class="sidebar-link-icon">
                          <v-icon :icon="item.icon" />
                        </div>
                      </template>

                      <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
                      <v-list-item-title v-text="item.text" />
                    </v-list-item>
                  </template>

                  <template v-if="item.subItems && item.subItems.length">
                    <template
                      v-for="(subItem) in item.subItems"
                      :key="subItem.text"
                    >
                      <v-list-item
                        v-if="userHasOneOfPermissions(
                          currentUser, subItem?.permissions || []
                        )"
                        :to="subItem.to"
                        append-icon="mdi-chevron-right"
                        color="primary"
                        rounded="xl"
                        exact
                      >
                        <v-tooltip :text="subItem.text">
                          <template #activator="{ props }">
                            <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
                            <v-list-item-title v-bind="props" v-text="subItem.text" />
                          </template>
                        </v-tooltip>
                      </v-list-item>
                    </template>
                  </template>
                </v-list-group>
                <v-divider v-if="index + 1 !== menuItem.items.length" class="my-1" />
              </template>
            </template>
          </v-list>
        </template>
      </v-card>
    </div>
  </template>

  <div>
    <small class="ml-3">Account</small>
    <v-card density="compact" class="mt-1 mb-4" rounded="xl" elevation="0">
      <template #text>
        <v-list class="py-0">
          <v-list-item color="primary" rounded="xl" @click="signOut({ callbackUrl: '/login' })">
            <template #prepend>
              <div class="sidebar-link-icon">
                <v-icon icon="mdi-logout-variant" />
              </div>
            </template>

            <v-list-item-title>Log out</v-list-item-title>
          </v-list-item>
        </v-list>
      </template>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { PERMISSIONS, userHasOneOfPermissions } from '@/utilities/auth.util'
import { UserI } from '~/types/user'

const { signOut, data: currentUserData } = useAuth()
const currentUser = currentUserData.value as UserI

const groupedMenuItems: Array<{
  text: string,
  items: Array<{
    text: string,
    icon: string,
    to?: string,
    permissions?: string[],
    subItems?: Array<{
      text: string,
      to: string,
      permissions?: string[]
    }>
  }>
}> = [
  {
    text: 'Menu',
    items: [
      {
        text: 'Home',
        icon: 'mdi-view-dashboard',
        to: '/admin',
        permissions: [PERMISSIONS.TRANSACTION.READ, PERMISSIONS.TRANSACTION.READ_OWN_TRANSACTIONS]
      },
      {
        text: 'Initiate Transaction',
        icon: 'mdi-bank-plus',
        to: '/admin/ajout-transaction-airtel-money',
        permissions: [PERMISSIONS.TRANSACTION.CREATE]
      },
      {
        text: 'Approve Transactions',
        icon: 'mdi-bank',
        to: '/admin/transactions-to-validate',
        permissions: [
          PERMISSIONS.TRANSACTION.READ,
          PERMISSIONS.TRANSACTION.READ_TRANSACTIONS_TO_VALIDATE
        ]
      },
      {
        text: 'Transactions',
        icon: 'mdi-bank',
        to: '/admin/transaction-list',
        permissions: [PERMISSIONS.TRANSACTION.READ, PERMISSIONS.TRANSACTION.READ_OWN_TRANSACTIONS]
      }
    ]
  },
  {
    text: 'Administration',
    items: [
      {
        text: 'Users',
        icon: 'mdi-account-group',
        to: '/admin/users',
        permissions: [PERMISSIONS.USER.READ]
      },
      {
        text: 'Roles',
        icon: 'mdi-security',
        to: '/admin/roles',
        permissions: [PERMISSIONS.ROLE.READ]
      }
    ]
  }
]
</script>

<style type="scss">
.sidebar-link-icon {
  margin-right: 20px;
  border: 1px solid #eee;
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  background-color: #eee;
}
</style>
~/utilities/auth.util
