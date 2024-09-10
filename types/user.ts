import { BranchI } from './branch'
import { RoleI } from './role'

export interface UserI {
  id: number;
  email: string;
  validateMaxAmountCDF: number;
  validateMaxAmountUSD: number;
  createdByUserId: number;
  validatedByUserId: number;
  locked: boolean;
  roles?: RoleI[];
  branch?: BranchI;
}
