import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field } from 'src/modules/field/schemas/field.schema';
import { Data } from 'src/modules/data/schemas/data.schema';

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

    @Prop({ type: [{ type: Types.ObjectId, ref: Field.name }] })
    fields: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: Data.name }] })
    data: Types.ObjectId[];
}

export const ReportSchema = SchemaFactory.createForClass(Report);
