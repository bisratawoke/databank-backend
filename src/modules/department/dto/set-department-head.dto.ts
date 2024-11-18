import { IsMongoId } from 'class-validator';

export class SetDepartmentHeadDto {
  @IsMongoId()
  readonly headId: string;
}
