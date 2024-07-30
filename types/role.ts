import { RessourceI } from './ressource'
import { PermissionI } from './permission'

export interface RoleI {
  id: number;
  name: string;
  permissions?: PermissionI[]
  ressources?: RessourceI[]
}

export enum RoleE {
  ADMIN = 'admin',
  TELLER = 'TELLER',
  DOMOPS = 'DOMOPS',
  CSO = 'CSO',
}
