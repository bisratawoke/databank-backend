import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class FieldType extends Document {
  @Prop({ required: true, unique: true, type: String })
  name: string;
  @Prop({ required: false })
  description: string;
  @Prop({ required: false })
  exampleValue: string;
}

export const FieldTypeSchema = SchemaFactory.createForClass(FieldType);
