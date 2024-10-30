import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsArray, IsBoolean, IsDate, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { UserRole } from '../../constants/user-role';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()

  @IsArray()
  @IsOptional()
  roles?: UserRole[];

  @ApiPropertyOptional()

  @IsString()
  @IsOptional()
  department?: string;


  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emailVerificationToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  lastLogin?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  passwordResetToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  passwordResetExpires?: Date;
}
