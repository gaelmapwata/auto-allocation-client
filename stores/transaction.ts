import { defineStore } from 'pinia'
import { useSnackbarStore } from '@/stores/snackbar'
import { TransactionI } from '../types/transaction'

// eslint-disable-next-line import/prefer-default-export
export const useTransactionStore = defineStore('transaction', {
  actions: {
    storeTransaction (transaction: TransactionI) {
      return new Promise((resolve, reject) => {
        useFetchApi('/transactions', {
          method: 'post',
          body: transaction
        }).then(({ data }) => {
          if (data.value) {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('Transaction effectué avec succès')

            resolve(data.value)
          } else {
            reject()
          }
        })
      })
    }
  }
})
