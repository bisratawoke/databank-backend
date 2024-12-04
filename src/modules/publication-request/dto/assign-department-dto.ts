import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export default class AssginDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The id of the department',
    type: 'string',
    required: true,
  })
  departmentId: string;
}
