import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Field extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'FieldType', required: true })
  type: Types.ObjectId;

  @Prop({ default: false })
  filtered: boolean;
}

export const FieldSchema = SchemaFactory.createForClass(Field);
