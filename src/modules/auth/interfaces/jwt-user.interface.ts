import { UserRole } from '../constants/user-role';

export interface IJwtUser {
  iat?: number;
  exp?: number;
  sub: string;
  email: string;
}
