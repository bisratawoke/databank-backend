import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../constants/user-role";

export class UserDto {
    @ApiProperty()
    email: string;
    @ApiProperty()
    firstName: string;
    @ApiProperty()
    lastName: string;
    @ApiProperty()
    roles: UserRole[];
    @ApiProperty()
    isEmailVerified: boolean;
    @ApiProperty()
    isActive: boolean;
    @ApiProperty()
    department: string;
    @ApiProperty()
    lastLogin: Date;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    updatedAt: Date;
}