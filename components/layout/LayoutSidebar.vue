<template>
  <div class="layout-sidebar-container">
    <div class="layout-sidebar-content">
      <div class="h-100 d-flex flex-column justify-space-between">
        <div>
          <v-card
            rounded="xl"
            elevation="0"
          >
            <template #text>
              <div class="d-flex align-center">
                <v-avatar color="primary" class="mr-2">
                  <v-icon icon="mdi-account-circle" />
                </v-avatar>
                <div class="header-infos">
                  <small> Connecté en tant que </small> <br>
                  <v-tooltip :text="currentUser.email" location="bottom">
                    <template #activator="{ props }">
                      <span
                        v-bind="props"
                        class="text-primary"
                      >
                        {{ currentUser.email }}
                      </span>
                    </template>
                  </v-tooltip>
                </div>
              </div>
            </template>
          </v-card>

          <div class="mt-3">
            <LayoutSidebarLinks />
          </div>
        </div>

        <div class="text-center">
          <img src="~/assets/images/logo/UBA-Logo.svg" class="my-2" alt="logo-uba" width="80px">
        </div>
      </div>
    </div>

    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { UserI } from '~/types/user'

const { data } = useAuth()
const currentUser = data.value as UserI
</script>

<style lang="scss">
@import "@/assets/scss/mixins.scss";

  .layout-sidebar-container {
    display: flex;
    padding: 10px;
    box-sizing: border-box;
    .layout-sidebar-content {
      width: 300px;
      background: $bg-card;
      padding: 10px;
      border-radius: 20px;
      height: calc(100vh - 20px);
      overflow-y: scroll;
      position: fixed;
      @include stylized-scrollbar;
      .header-infos {
        width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .content {
      padding: 10px;
      width: calc(100% - 310px);
      background: $bg-card;
      border-radius: 20px;
      margin-left: 10px;
      transform: translateX(300px);
    }
  }
</style>
