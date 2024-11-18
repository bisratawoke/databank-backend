// dto/UpdateStatus.dto.ts
import { IsEnum, IsOptional } from 'class-validator';
import { Status } from '../schemas/report.schema';

export class UpdateStatusDto {
  @IsEnum(Status)
  status: Status;

  @IsOptional() // This field is optional if you want to update it separately
  @IsEnum(Status)
  data_status?: Status;
}
