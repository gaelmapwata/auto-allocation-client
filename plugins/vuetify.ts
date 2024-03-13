import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      themes: {
        light: {
          dark: false,
          colors: {
            primary: '#D51709',
            secondary: '#E4A79D'
          }
        }
      }
    }
  })
  app.vueApp.use(vuetify)
})
