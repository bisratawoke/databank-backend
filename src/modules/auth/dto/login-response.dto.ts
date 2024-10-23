import { User } from '@prisma/client';
import { Expose } from "class-transformer";
import { UserRole } from '../constants/user-role';

export class UserResponseDto {
    @Expose()
    id: number;

    @Expose()
    email: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    roles: UserRole[];

    @Expose()
    isActive: boolean;

    @Expose()
    isEmailVerified: boolean;

    @Expose()
    department: string | null;

    @Expose()
    lastLogin: Date;
}


export function userToDto(user: User): UserResponseDto {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((role) => role as UserRole),
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        department: user.department,
        lastLogin: user.lastLogin,
    };
}