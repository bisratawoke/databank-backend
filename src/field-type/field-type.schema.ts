import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class FieldType extends Document {
  @Prop({ required: true })
  name: string;
}

export const FieldTypeSchema = SchemaFactory.createForClass(FieldType);
