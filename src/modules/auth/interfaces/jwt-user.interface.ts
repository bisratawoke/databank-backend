import { UserRole } from '../constants/user-role';

export interface IJwtUser {
    iat?: number;
    exp?: number;
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;

}