import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types, Document } from 'mongoose';
import { PortalUser } from 'src/modules/auth/schemas/portal-user.schema';
import { PublicationRequest } from 'src/modules/publication-request/schemas/publication-request.schema';

export enum PaymentStatus {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
}

@Schema()
export default class Payment extends Document {
  @Prop({ required: false, type: Number })
  price: number;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: PortalUser.name })
  author: Types.ObjectId;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: PublicationRequest.name,
  })
  publciationRequest: Types.ObjectId;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
