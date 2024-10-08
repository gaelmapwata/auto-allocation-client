import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/scss/main.scss'],
  runtimeConfig: {
    public: {
      baseURL: process.env.API_BASE_URL,
      serverBaseURL: process.env.SERVER_BASE_URL,
      cryptoPrivateKey: process.env.CRYPTO_PRIVATE_KEY
    }
  },
  modules: [
    '@nuxtjs/eslint-module',
    '@vee-validate/nuxt',
    '@sidebase/nuxt-auth',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    }
  ],
  devServer: {
    host: '127.0.0.1',
    port: 3000
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/scss/variables.scss" as *;'
        }
      }
    },
    vue: {
      template: {
        transformAssetUrls
      }
    }
  },
  auth: {
    provider: {
      type: 'local',
      pages: {
        login: '/login'
      },
      endpoints: {
        signIn: { path: '/check-otp', method: 'post' },
        // signOut: { path: '/logout', method: 'post' },
        getSession: { path: '/user', method: 'get' }
      },
      token: {
        maxAgeInSeconds: 60 * 60 * 8 // 8 hours
      }
    },
    baseURL: `${process.env.API_BASE_URL}/auth`,
    globalAppMiddleware: true
  },
  build: {
    transpile: ['@vuepic/vue-datepicker', 'vuetify']
  },
  typescript: {
    strict: true,
    typeCheck: true
  },
  nitro: {
    compressPublicAssets: true // Compresser les assets publics pour le déploiement
  },
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('custom-')
    }
  }
})
