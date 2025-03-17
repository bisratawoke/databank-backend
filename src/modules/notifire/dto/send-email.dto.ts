import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({
    description: 'Subject of the email',
    example: 'Test Subject',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Body content of the email',
    example: 'This is a test email.',
  })
  @IsString()
  body: string;

  @ApiProperty({
    description: 'Recipient email address',
    example: 'recipient@example.com',
  })
  @IsEmail()
  recipient: string;
}
