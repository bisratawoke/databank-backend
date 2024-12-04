import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export default class PaymentSetupDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Price of the publication',
    type: Number,
    required: true,
  })
  price: number;
}
