<template>
  <div class="page-container">
    <v-row align="center">
      <v-col cols="12" md="5" lg="4">
        <v-card color="primary" class="no-card-border">
          <v-card-text>
            <div class="d-lg-flex">
              <v-avatar color="yellow">
                <span class="text-h5 text-uppercase">{{ currentUser.email[0] }}</span>
              </v-avatar>
              <p class="ml-5 mt-2 overflow-auto">
                Bonjour <br>
                <strong class="text-yellow">{{ currentUser.email }}</strong>
              </p>
            </div>
            <v-divider class="my-2" />
            <p class="ml-5">
              Bienvenu sur votre tableau de bord personnel
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="7" lg="8">
        <div>
          <p
            v-if="userHasOneOfPermissions(currentUser, [PERMISSIONS.TRANSACTION.READ])"
            class="mb-1"
          >
            Chiffres clés des transactions effectuées avec succès
          </p>
          <p
            v-else-if="
              userHasOneOfPermissions(currentUser, [PERMISSIONS.TRANSACTION.READ_OWN_TRANSACTIONS])
            "
            class="mb-1"
          >
            Chiffres clés des vos transactions effectuées avec succès
          </p>
          <TransactionKeyData />
        </div>
      </v-col>

      <v-col cols="12">
        <v-divider class="mt-4 mb-6" />

        <p class="mb-1 d-flex mb-4">
          <v-icon class="text-primary mr-4">
            mdi-alert-octagram
          </v-icon>
          <span>Dernières transactions enregistrées</span>
        </p>
        <v-card rounded="xl" elevation="0">
          <v-card-text>
            <TransactionListRecent />
          </v-card-text>
        </v-card>
        <div class="d-flex justify-center">
          <v-btn
            href="admin/transaction-list"
            class="mt-4 text-none"
            color="primary"
            elevation="0"
            rounded="xl"
          >
            Afficher toutes les transactions
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { UserI } from '~/types/user'
import { PERMISSIONS, userHasOneOfPermissions } from '@/utilities/auth.util'

definePageMeta({
  layout: 'admin'
})

useAdminBreadcrumb('mdi-view-dashboard', [{
  title: 'Accueil',
  href: '/'
}])

const { data: currentUserData } = useAuth()
const currentUser = currentUserData.value as UserI
</script>
