export interface TransactionI {
  msisdn: string;
  lastName: string;
  firstName: string;
  amount: number;
  currency: string;
  note?: string;
  userId?: number;
  errorFinacle?: string;
  errorAirtelMoney?: string;
}
