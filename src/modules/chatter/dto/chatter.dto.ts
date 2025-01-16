import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateChatterDto {
  @ApiProperty({ type: String, description: 'Subject ID', required: true })
  subject: string;

  @ApiProperty({
    type: [String],
    description: 'Array of message IDs',
    required: false,
  })
  messages?: string[];
}

export class UpdateChatterDto {
  @ApiProperty({ type: String, description: 'Subject ID', required: false })
  subject?: string;

  @ApiProperty({
    type: [String],
    description: 'Array of message IDs',
    required: false,
  })
  messages?: string[];
}
