import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Metastore extends Document {
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  keyword: Array<string>;
  @Prop({ required: true })
  type: string;
  @Prop({ required: true })
  size: number;
  @Prop({ required: true })
  location: string;
  @Prop({ required: true })
  modified_date: string;
  @Prop({ required: true })
  created_date: string;
}

export const MetastoreSchema = SchemaFactory.createForClass(Metastore);
