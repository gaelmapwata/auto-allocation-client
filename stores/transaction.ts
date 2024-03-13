import { defineStore } from 'pinia'
import { useSnackbarStore } from '@/stores/snackbar'
import { TransactionI } from '../types/transaction'

const defaultStats = {
  today: 0,
  yesterday: 0,
  currentMonth: 0,
  currentWeek: 0
}

// eslint-disable-next-line import/prefer-default-export
export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    stats: defaultStats
  }),
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
    },
    getTransactionsStats (): Promise<void> {
      return new Promise((resolve) => {
        useFetchApi('/transactions/stats', {
          method: 'get'
        }).then(({ data }) => {
          if (data.value) {
            this.stats = data.value
          } else {
            this.stats = defaultStats
          }
          resolve()
        })
      })
    },
    fetchTransactions (
      { page, limit, filter }: {
        page: number,
        limit: number,
        filter?: { [key: string]: string | number | boolean }
      }
    ): Promise<{ data: TransactionI[], total: number }> {
      return new Promise((resolve) => {
        useFetchApi('/transactions', {
          method: 'get',
          params: {
            page,
            limit,
            ...(filter || {})
          }
        }).then(({ data }) => {
          if (data.value) {
            resolve(data.value)
          }
        })
      })
    },
    exportTransactions (filter?: {
      [key: string]: string | number | boolean
    }): void {
      useFetchApi('/transactions/download-csv', {
        method: 'get',
        params: {
          ...(filter || {})
        }
      }).then(({ data }) => {
        if (data.value) {
          const fileUrl = URL.createObjectURL(data.value)
          window.open(fileUrl, '_blank')
        }
      })
    }
  }
})
