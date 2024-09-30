import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FieldType } from 'src/modules/field-type/schemas/field-type.schema';

@Schema()
export class Field extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: FieldType.name, required: true })
  type: Types.ObjectId;

  @Prop({ default: false })
  filtered: boolean;
}

export const FieldSchema = SchemaFactory.createForClass(Field);
