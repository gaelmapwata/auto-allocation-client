<template>
  <div>
    <div class="admin-layout-container">
      <LayoutSidebar>
        <div>
          <LayoutHeader />
        </div>
        <div>
          <CommonBreadcrumb />
          <div class="mt-3">
            <slot />
          </div>
        </div>
      </LayoutSidebar>
    </div>

    <CommonSnackbar />
  </div>
</template>

<script lang="ts" setup>
const { signOut } = useAuth()

let idleTimeout: NodeJS.Timeout
const IDLE_TIME = 5 * 60 * 1000 // 5 minutes in milliseconds
const EVENTS_TO_LISTEN_FOR_IDLE = ['mousemove', 'keydown', 'click', 'scroll']

function resetTimer () {
  clearTimeout(idleTimeout)
  idleTimeout = setTimeout(onUserInactive, IDLE_TIME)
}

async function onUserInactive () {
  EVENTS_TO_LISTEN_FOR_IDLE.forEach(event => window.removeEventListener(event, resetTimer))
  clearTimeout(idleTimeout)
  await signOut({ callbackUrl: '/login' })
}

EVENTS_TO_LISTEN_FOR_IDLE.forEach(event => window.addEventListener(event, resetTimer))
resetTimer()
</script>

<style lang="scss">
  .admin-layout-container {
    background-color: white;
    width: 100%;
    min-height: 100vh;
  }
</style>
