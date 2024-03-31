import { defineStore } from 'pinia'
import { CheckKYCResponseI } from '~/types/airtel-money'

// eslint-disable-next-line import/prefer-default-export
export const useAirtelMoneyStore = defineStore('airtelMoney', {
  actions: {
    checkKYCByMsisdn (msisdn: string, currency: string): Promise<CheckKYCResponseI> {
      return new Promise((resolve, reject) => {
        useFetchApi(`/check-kyc/${msisdn}`, {
          method: 'get',
          params: {
            currency
          }
        }).then(({ data, error }) => {
          if (data.value) {
            resolve(data.value)
          } else {
            reject(error.value)
          }
        })
      })
    }
  }
})
