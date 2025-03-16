import { ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
} from 'class-validator';
import { PortalUserType } from '../../constants/portal-user-role';
import { IsRequiredByUserType } from '../../../../decorators/is-required-by-user-type.decorator';

@ApiTags('portal-users')
export class CreatePortalUserDto {
  @ApiProperty({
    enum: PortalUserType,
    description:
      'The type of the user (Individual, Company, NGO, or Foreign Company)',
  })
  @IsEnum(PortalUserType)
  userType: PortalUserType;

  @ApiProperty({
    description: 'The full name of the user',
  })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({
    description:
      'The company name (required for Company, NGO, and Foreign Company)',
  })
  @IsOptional()
  @IsString()
  @IsRequiredByUserType(
    [
      PortalUserType.COMPANY,
      PortalUserType.NGO,
      PortalUserType.FOREIGN_COMPANY,
    ],
    {
      message:
        'Company name is required for company, NGO, and foreign company users',
    },
  )
  companyName?: string;

  @IsString()
  @IsOptional()
  country: string;
  @ApiProperty({
    description: 'The email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description:
      'The phone number (required for Company, NGO, and Foreign Company)',
  })
  @IsOptional()
  @IsString()
  @IsRequiredByUserType(
    [
      PortalUserType.COMPANY,
      PortalUserType.NGO,
      PortalUserType.FOREIGN_COMPANY,
    ],
    {
      message:
        'Phone number is required for company, NGO, and foreign company users',
    },
  )
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'The mobile number (required for Individual)',
  })
  @IsOptional()
  @IsString()
  @IsRequiredByUserType([PortalUserType.INDIVIDUAL], {
    message: 'Mobile number is required for individual users',
  })
  mobileNumber?: string;

  @ApiProperty({
    description: 'The password of the user',
    minLength: 8,
  })
  @MinLength(8)
  password: string;
}

export class PortalUserLoginDto {
  @ApiProperty({
    description: 'The email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
  })
  @IsString()
  password: string;
}
