import { defineStore } from 'pinia'
import { useSnackbarStore } from '@/stores/snackbar'
import { HttpPaginationResponseI } from '~/types/http'
import { UserI } from '../types/user'

// eslint-disable-next-line import/prefer-default-export
export const useUserStore = defineStore('user', {
  state: () => ({}),
  actions: {
    storeUser (user: UserI) {
      return new Promise((resolve) => {
        useFetchApi('/users', {
          method: 'post',
          body: user
        }).then(({ status, data }) => {
          if (status.value === 'success') {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('Utilisateur ajouté avec succès')

            resolve(data.value)
          }
        })
      })
    },
    // eslint-disable-next-line max-len
    fetchUsersWithPagination ({ page, limit }: { page: number, limit: number }): Promise<HttpPaginationResponseI<UserI[]>> {
      return new Promise((resolve) => {
        useFetchApi('/users', {
          method: 'get',
          params: {
            page,
            limit
          }
        }).then(({ data }) => {
          if (data.value) {
            resolve(data.value)
          }
        })
      })
    },
    updateUser (payload: UserI) {
      return new Promise((resolve) => {
        useFetchApi(`/users/${payload.id}`, {
          method: 'put',
          body: payload
        }).then(({ status, data }) => {
          if (status.value === 'success') {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('Utilisateur modifié avec succès')

            resolve(data.value)
          }
        })
      })
    },
    deleteUser (userId: number) {
      return new Promise((resolve) => {
        useFetchApi(`/users/${userId}`, {
          method: 'delete'
        }).then(({ status }) => {
          if (status.value === 'success') {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('Utilisateur supprimé avec succès')

            resolve(null)
          }
        })
      })
    },
    lockUser (userId: number) {
      return new Promise((resolve) => {
        useFetchApi(`/users/${userId}/lock`, {
          method: 'put'
        }).then(({ status, data }) => {
          if (status.value === 'success') {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('Utilisateur bloqué avec succès')

            resolve(data.value)
          }
        })
      })
    },
    unlockUser (userId: number) {
      return new Promise((resolve) => {
        useFetchApi(`/users/${userId}/unlock`, {
          method: 'put'
        }).then(({ status, data }) => {
          if (status.value === 'success') {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('Utilisateur débloqué avec succès')

            resolve(data.value)
          }
        })
      })
    }
  }
})
