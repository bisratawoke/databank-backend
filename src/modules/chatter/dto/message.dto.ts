import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateMessageDto {
  @ApiProperty({ type: String, description: 'Message ID', required: true })
  message: string;

  @ApiProperty({ type: String, description: 'Message ID', required: true })
  userId: string;
}
