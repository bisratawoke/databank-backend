import { IsNotEmpty, IsString, IsArray, IsEnum } from 'class-validator';
import { Types } from 'mongoose';
import { ADMIN_UNITS, Status } from '../schemas/publication-request.schema';

export class CreatePublicationRequestDto {
  @IsArray()
  @IsNotEmpty()
  category: Types.ObjectId[];

  @IsNotEmpty()
  @IsString()
  preferredDataFormat: string;

  @IsNotEmpty()
  @IsString()
  purposeForResearch: string;

  @IsNotEmpty()
  @IsString()
  dateImportance: string;

  @IsEnum(Status)
  status?: Status;

  @IsEnum(ADMIN_UNITS)
  adminUnits?: ADMIN_UNITS;
}
