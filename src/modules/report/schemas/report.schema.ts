import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { User } from 'src/modules/auth/schemas/user.schema';

export enum Status {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Published = 'published',
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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  author: Types.ObjectId;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
