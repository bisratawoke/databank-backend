import { UserRole } from '../constants/user-role';

export interface IJwtUser {
    iat?: number;
    exp?: number;
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;

}