// src/modules/metastore/schemas/metastore.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Publication } from '../../publication/schemas/publication.schema';

export type MetastoreDocument = Metastore & Document;

@Schema({ timestamps: true })
export class Metastore {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], required: true })
  keyword: string[];

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  location: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Publication' })
  publication: Publication;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const MetastoreSchema = SchemaFactory.createForClass(Metastore);