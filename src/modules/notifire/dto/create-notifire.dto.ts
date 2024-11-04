import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreateNotifireDto {
  @ApiProperty({
    description: 'Message of the notifire',
    example: 'Notification message',
  })
  @IsNotEmpty()
  readonly message: string;

  @ApiProperty({
    description: 'Whether the notification has been seen',
    example: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly seen: boolean;

  @ApiProperty({
    description: 'User ID associated with the notifire',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsNotEmpty()
  readonly user: Types.ObjectId;
}
