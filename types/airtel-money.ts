export interface CheckKYCResponseI {
  is_barred: boolean,
  grade: string,
  last_name: string,
  registration: {
      status: string
  },
  msisdn: string,
  first_name: string,
  is_pin_set: boolean
}
