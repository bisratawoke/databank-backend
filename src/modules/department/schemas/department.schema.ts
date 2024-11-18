import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema()
export class Department extends Document {
  @Prop({ required: true, unique: true, type: String })
  name: string;
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  category: Types.ObjectId[];
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  head: Types.ObjectId;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
