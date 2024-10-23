import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export enum Status {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

@Schema()
export class Report extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  start_date: Date;

  @Prop({ required: true })
  end_date: Date;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Field' }] })
  fields: Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Data' }] })
  data: Types.ObjectId[];

  @Prop({ enum: Status, default: Status.Pending })
  status: Status;

  @Prop({ enum: Status, default: Status.Pending })
  data_status: Status;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
