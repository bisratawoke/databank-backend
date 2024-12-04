import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PaymentStatus {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
}

@Schema()
export default class PublicationPayment extends Document {
  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;
}

export const PublicationPaymentSchema =
  SchemaFactory.createForClass(PublicationPayment);
