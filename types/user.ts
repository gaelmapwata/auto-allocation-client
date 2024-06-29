import { RoleI } from './role'

export interface UserI {
  id: number;
  email: string;
  validateMaxAmountCDF: number;
  validateMaxAmountUSD: number;
  locked: boolean;
  roles?: RoleI[];
}
