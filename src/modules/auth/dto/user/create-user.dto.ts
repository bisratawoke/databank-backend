import { IsEmail, IsString, IsArray, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '../../constants/user-role';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsArray()
    @IsOptional()
    roles?: UserRole[];

    @IsString()
    @IsOptional()
    department?: string;
}