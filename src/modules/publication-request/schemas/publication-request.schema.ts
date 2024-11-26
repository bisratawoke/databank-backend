import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { PortalUser } from 'src/modules/auth/schemas/portal-user.schema';

export enum ADMIN_UNITS {
  NATIONAL = 'National',
  REGINAL = 'Reginal',
  WOREDA = 'Woreda',
  ZONEAL = 'Zoneal',
  KEBELE = 'Kebele',
}

export enum Status {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  Rejected = 'Rejected',
}

@Schema()
export class PublicationRequest extends Document {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  category: Types.ObjectId[];

  @Prop({ required: true, unique: false, type: String })
  preferredDataFormat: string;

  @Prop({ required: true, unique: false, type: String })
  purposeForResearch: string;

  @Prop({ required: true, unique: false, type: String })
  dateImportance: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: PortalUser.name })
  author: Types.ObjectId;

  @Prop({ enum: Status, default: Status.PENDING })
  status: Status;

  @Prop({ enum: ADMIN_UNITS, default: ADMIN_UNITS.NATIONAL })
  adminUnits: ADMIN_UNITS;

  @Prop({ type: [{ required: false, unique: false, type: String }] })
  attachments: string[];
}

export const PublicationRequestSchema =
  SchemaFactory.createForClass(PublicationRequest);
