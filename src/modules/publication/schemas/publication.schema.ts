// src/modules/publication/schemas/publication.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from 'src/modules/auth/schemas/user.schema';

export type PublicationDocument = Publication & Document;

enum PUBLICATION_TYPE {
  PUBLIC,
  INTERNAL,
}

export enum Status {
  Pending = 'Pending',
  Rejected = 'Rejected',
  Published = 'Published',
  Approved = 'Approved',
}

@Schema({ timestamps: true })
export class Publication {
  @Prop({ enum: Status, default: Status.Pending })
  status: Status;

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

  @Prop({ type: String, enum: PUBLICATION_TYPE, required: true })
  publicationType: PUBLICATION_TYPE;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Department' })
  department: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  author: Types.ObjectId;

  @Prop({ type: Boolean, required: true, default: false })
  paymentRequired: Boolean;

  @Prop({ type: Number, required: false })
  price: Number;

  @Prop({ type: String, required: false })
  coverImageLink: string;

  @Prop({ required: true })
  uploadDate: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);
