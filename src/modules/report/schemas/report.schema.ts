import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { User } from 'src/modules/auth/schemas/user.schema';

export enum Status {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Published = 'published',
}

export enum COVERAGE {
  REGIONAL = 'Regional',
  NATIONAL = 'National',
  ZONAL = 'Zonal',
  WOREDA = 'WOREDA',
}

export enum FREQUENCY {
  ANNUAL = 'Annual',
  QUARTERLY = 'Quarterly',
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

  @Prop({ enum: COVERAGE, default: COVERAGE.NATIONAL })
  coverage: COVERAGE;

  @Prop({ enum: FREQUENCY, default: FREQUENCY.ANNUAL })
  frequency: FREQUENCY;

  @Prop({ type: String, required: false })
  unit: string;

  @Prop({ type: String, required: false })
  classification: string;

  @Prop({ type: String, required: false })
  method: string;

  @Prop({ type: String, required: false })
  data_quality_limitations: string;

  @Prop({ type: String, required: false })
  time_coverage: string;

  @Prop({ type: String, required: false })
  update_frequency: string;

  @Prop({ type: String, required: false })
  access_restrictions: string;

  @Prop({ type: Number, required: false })
  payment_amount: number;

  @Prop({ type: String, required: false })
  licenses_terms_of_use: string;

  @Prop({ type: String, required: false })
  contact_information: string;

  @Prop({ type: [String], required: false })
  file_formats_available: string[];

  @Prop({ type: Boolean, default: false })
  api_access: boolean;

  @Prop({ type: String, required: false })
  data_structure_information: string;

  // Newly added missing fields
  @Prop({ type: String, required: false })
  data_provider: string;

  @Prop({ type: String, required: false })
  data_source_and_collection: string;

  @Prop({ type: String, required: false })
  data_geo_coverage: string;

  @Prop({ type: String, required: false })
  data_collection_method: string;

  @Prop({ type: String, required: false })
  data_processing_adjustment: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
