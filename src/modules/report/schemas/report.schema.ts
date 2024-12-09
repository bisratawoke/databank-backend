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
  REGINAL = 'Regional',
  NATIONAL = 'National',
  ZONAL = 'Zonal',
  WOREDA = 'WOREDA',
}
export enum FREQUECNY {
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

  @Prop({ enum: FREQUECNY, default: FREQUECNY.ANNUAL })
  frequency: FREQUECNY;

  @Prop({ type: String, required: false })
  unit: string;

  @Prop({ type: String, required: false })
  classification: string;

  @Prop({ type: String, required: false })
  method: string;

  // New fields
  @Prop({ type: String, required: false })
  data_quality_limitations: string; // Information on the accuracy, reliability, and limitations of the dataset.

  @Prop({ type: String, required: false })
  time_coverage: string; // The specific years or time periods that the dataset covers.

  @Prop({ type: String, required: false })
  update_frequency: string; // How often the dataset is updated and made available.

  @Prop({ type: String, required: false })
  access_restrictions: string; // Information on who can access the data and any restrictions on usage.

  @Prop({ type: Number, required: false })
  payment_amount: number; // Amount of payment if the data is for sale.

  @Prop({ type: String, required: false })
  licenses_terms_of_use: string; // Licensing information or terms and conditions for data usage.

  @Prop({ type: String, required: false })
  contact_information: string; // Details for support or inquiries related to the data.

  @Prop({ type: [String], required: false })
  file_formats_available: string[]; // Formats in which the dataset can be downloaded or accessed.

  @Prop({ type: Boolean, default: false })
  api_access: boolean; // Turn on/off API.

  @Prop({ type: String, required: false })
  data_structure_information: string; // Detailed information on the data structure.
}

export const ReportSchema = SchemaFactory.createForClass(Report);
