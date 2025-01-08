import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../schemas/payment';

export class CreatePublicationPaymentDto {
  @ApiProperty({
    description: 'Price of the publication payment',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: 'Status of the payment',
    example: PaymentStatus.PENDING,
    enum: PaymentStatus,
  })
  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Reference to the author user',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsNotEmpty()
  author: string;

  @ApiProperty({
    description: 'Reference to the publication request user',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsOptional()
  publciationRequest: string;
}

export class UpdatePublicationPaymentDto {
  @ApiProperty({
    description: 'Price of the publication payment',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: 'Status of the payment',
    example: PaymentStatus.CONFIRMED,
    enum: PaymentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({
    description: 'Reference to the author user',
    example: '60d21b4667d0d8992e610c85',
    required: false,
  })
  @IsOptional()
  author?: string;

  @ApiProperty({
    description: 'Reference to the publication request user',
    example: '60d21b4667d0d8992e610c85',
    required: false,
  })
  @IsOptional()
  publciationRequest?: string;
}
