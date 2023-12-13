<template>
  <div class="login-container">
    <div class="w-100 text-center mb-10">
      <img src="~/assets/images/logo/UBA-Logo-white.svg" alt="logo-uba" class="logo-uba">
    </div>
    <div class="login-cotent">
      <v-row no-gutters style="height: 100%;">
        <v-col col="12" md="7">
          <LoginForm />
        </v-col>
        <v-col class="d-none d-md-block" md="5">
          <LoginSlide />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  }
})
</script>

<style lang="scss">
.login-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  background-image:
    linear-gradient(
      rgba(black, 0.6),
      rgba(black, 0.6)
    ),
    url('~/assets/images/pic1.jpg');
  min-height: 100vh;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: left top;
  flex-wrap: wrap;
  .logo {
    width: 100px;
  }
  .login-cotent {
    background-color: white;
    max-width: 450px;
    width: 100%;
    height: 490px;
    background-color: white;
    border-radius: 50px;
    margin: 20px;
  }
  @media (min-width: 960px) {
    .login-cotent {
      max-width: 700px;
    }
  }
}

</style>
