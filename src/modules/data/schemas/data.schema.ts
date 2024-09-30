import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field } from 'src/modules/field/schemas/field.schema';

@Schema()
export class Data extends Document {
    @Prop({ type: Types.ObjectId, ref: Field.name, required: true })
    field: Types.ObjectId;

    @Prop({ required: true })
    value: string;
}

export const DataSchema = SchemaFactory.createForClass(Data);
