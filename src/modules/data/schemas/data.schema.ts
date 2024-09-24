import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FieldType } from './field-type.schema';

@Schema()
export class Data extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: FieldType.name, required: true })
    type: Types.ObjectId;
}

export const DataSchema = SchemaFactory.createForClass(Data);
