// src/modules/publication/schemas/publication.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type PublicationDocument = Publication & Document;

enum PUBLICATION_TYPE {
  PUBLIC,
  INTERNAL,
  FOR_SALE,
}

@Schema({ timestamps: true })
export class Publication {
  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  bucketName: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Metastore',
    required: true,
  })
  metaStoreId: Types.ObjectId;

  @Prop({ required: true })
  permanentLink: string;

  @Prop({ required: true })
  uploadDate: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  author?: string;

  @Prop({ type: String, enum: PUBLICATION_TYPE, required: true })
  publicationType: PUBLICATION_TYPE;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Department' })
  department: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);
