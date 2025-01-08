import { Module } from '@nestjs/common';
import { PublicationPaymentController } from './payment.controller';
import { PublicationPaymentService } from './payment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import PublicationPayment, { PaymentSchema } from './schemas/payment';
import { PublicationRequestModule } from '../publication-request/publication-request.module';
import {
  PublicationRequest,
  PublicationRequestSchema,
} from '../publication-request/schemas/publication-request.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PublicationPayment.name, schema: PaymentSchema },
      { name: PublicationRequest.name, schema: PublicationRequestSchema },
    ]),

    AuthModule,
    PublicationRequestModule,
  ],
  controllers: [PublicationPaymentController],
  providers: [PublicationPaymentService],
})
export class PaymentModule {}

