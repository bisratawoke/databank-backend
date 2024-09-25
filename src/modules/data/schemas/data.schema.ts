import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field } from 'src/modules/field/field.schema';

@Schema()
export class Data extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: Field.name, required: true })
    type: Types.ObjectId;
}

export const DataSchema = SchemaFactory.createForClass(Data);
