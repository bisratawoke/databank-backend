import { Expose, plainToClass } from 'class-transformer';
import { UserRole } from '../../constants/user-role';
import { User } from "../../schemas/user.schema";

export class UserResponseDto {
    @Expose()
    _id: string;

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
    department: any;

    @Expose()
    lastLogin: Date;
}



export class PaginationMetadata {
    @Expose()
    currentPage: number;

    @Expose()
    totalPages: number;

    @Expose()
    pageSize: number;

    @Expose()
    totalCount: number;

    @Expose()
    hasNextPage: boolean;

    @Expose()
    hasPreviousPage: boolean;
}

export class UsersResponseDto {
    @Expose()
    users: UserResponseDto[];

    @Expose()
    total: number;

    @Expose()
    metadata: PaginationMetadata;
}



export function userToDto(data: User | User[] | null | undefined): UserResponseDto | UserResponseDto[] | null {
    // Handle null or undefined input
    if (!data) {
        return null;
    }

    // Handle array of users
    if (Array.isArray(data)) {
        return data.map((user) => transformSingleUser(user));
    }

    // Handle single user
    return transformSingleUser(data);
}

// Helper function to transform a single user
function transformSingleUser(user: User): UserResponseDto {
    // Handle case where user might be a Mongoose document
    const userData = user.toObject ? user.toObject() : user;

    return {
        _id: userData._id.toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        roles: userData.roles.map((role) => role as UserRole),
        isActive: userData.isActive,
        isEmailVerified: userData.isEmailVerified,
        department: userData.department ? userData.department : null,
        lastLogin: userData.lastLogin,
    };
}

// Helper function to create paginated response
export function createPaginatedResponse(
    users: User[],
    total: number
): UsersResponseDto {
    return {
        users: userToDto(users) as UserResponseDto[],
        metadata: new PaginationMetadata(),
        total
    };
}