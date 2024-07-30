import { defineStore } from 'pinia'

// eslint-disable-next-line import/prefer-default-export
export const useAuthStore = defineStore('auth', {
  actions: {
    signin (payload: { email: string, password: string }) {
      return useFetchApi('/auth/signin', {
        method: 'POST',
        body: payload
      })
    }
  }
})
