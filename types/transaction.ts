import { BranchI } from './branch'
import { UserI } from './user'

export interface TransactionI {
  id: number;
  msisdn: string;
  lastName: string;
  firstName: string;
  amount: number;
  currency: string;
  note?: string;
  userId?: number;
  errorFinacle?: string;
  errorAirtelMoney?: string;
  success: boolean;
  error: string;
  user: UserI;
  createdAt?: string;
  checkerId: number;
  checker?: UserI;
  drAcctNum: string;
  crAcctNum: string;
  branch?: BranchI;
}
