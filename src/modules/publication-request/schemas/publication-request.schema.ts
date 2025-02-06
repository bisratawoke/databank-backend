import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { PortalUser } from 'src/modules/auth/schemas/portal-user.schema';
import { Department } from 'src/modules/department/schemas/department.schema';
import PublicationPayment from './publication-payment.schema';

export enum ADMIN_UNITS {
  NATIONAL = 'National',
  REGINAL = 'Reginal',
  WOREDA = 'Woreda',
  ZONEAL = 'Zoneal',
  KEBELE = 'Kebele',
}

export enum Status {
  PENDING_DEPARMENT_ASSIGNMENT = 'Pending department assignment',
  PENDING_APPROVAL = 'Pending Approval',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  Rejected = 'Rejected',
  INITIAL_APPROVAL = 'Initial Approval',
  PAYMENT_PENDING = 'Payment pending',
  PAYMENT_VERIFIED = 'Payment verified',
  DEPUTY_APPROVED = 'Deputy Approved',
  FINAL_APPOVAL = 'Final Approved',
}

@Schema()
export class PublicationRequest extends Document {
  @Prop({ required: false, unique: false, type: String })
  fileName: string;

  @Prop({ required: false, unique: false, type: Boolean, default: false })
  paymentRequired: boolean;

  @Prop({
    required: false,
    type: mongoose.Types.ObjectId,
    ref: PublicationPayment.name,
  })
  paymentData: mongoose.Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  category: Types.ObjectId[];

  @Prop({ required: true, unique: false, type: String })
  preferredDataFormat: string;

  @Prop({ required: true, unique: false, type: String })
  purposeForResearch: string;

  @Prop({ required: true, unique: false, type: String })
  dateImportance: string;

  @Prop({ required: true, unique: false, type: String })
  dataSpecification: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: PortalUser.name })
  author: Types.ObjectId;

  @Prop({ enum: Status, default: Status.PENDING_DEPARMENT_ASSIGNMENT })
  status: Status;

  @Prop({ enum: ADMIN_UNITS, default: ADMIN_UNITS.NATIONAL })
  adminUnits: ADMIN_UNITS;

  @Prop({ type: [{ required: false, unique: false, type: String }] })
  attachments: string[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Department.name,
    required: false,
  })
  department: Types.ObjectId;

  @Prop({
    type: Date,
    default: Date.now,
  })
  createdAt: Date;
}

export const PublicationRequestSchema =
  SchemaFactory.createForClass(PublicationRequest);
