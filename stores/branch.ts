import { defineStore } from 'pinia'
import { useSnackbarStore } from '@/stores/snackbar'
import { HttpPaginationResponseI } from '~/types/http'
import { BranchI } from '../types/branch'

// eslint-disable-next-line import/prefer-default-export
export const useBranchStore = defineStore('branch', {
  actions: {
    // eslint-disable-next-line max-len
    fetchBranchesByLoggedBank ({ page, limit }: { page: number, limit: number }): Promise<HttpPaginationResponseI<BranchI[]>> {
      return new Promise((resolve) => {
        useFetchApi('/branches/by-logged-bank', {
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
    fetchAllBranchesByLoggedBank (): Promise<BranchI[]> {
      return new Promise((resolve) => {
        useFetchApi('/branches/all-by-logged-bank', {
          method: 'get'
        }).then(({ data }) => {
          if (data.value) {
            resolve(data.value)
          }
        })
      })
    },
    updateBranch (payload: BranchI) {
      return new Promise((resolve) => {
        useFetchApi(`/branches/${payload.id}`, {
          method: 'put',
          body: payload
        }).then(({ data }) => {
          if (data.value) {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('branche modifié avec succès')

            resolve(data.value)
          }
        })
      })
    },
    storeBranch (branch: BranchI) {
      return new Promise((resolve) => {
        useFetchApi('/branches', {
          method: 'post',
          body: branch
        }).then(({ data }) => {
          if (data.value) {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('branche ajoutée avec succès')

            resolve(data.value)
          }
        })
      })
    },
    deleteBranch (branchId: number) {
      return new Promise((resolve) => {
        useFetchApi(`/branches/${branchId}`, {
          method: 'delete'
        }).then(({ status }) => {
          if (status.value === 'success') {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('branche supprimée avec succès')

            resolve(null)
          }
        })
      })
    }
  }
})
