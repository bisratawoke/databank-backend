// src/modules/publication/schemas/publication.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type PublicationDocument = Publication & Document;

@Schema({ timestamps: true })
export class Publication {
    @Prop({ required: true })
    fileName: string;

    @Prop({ required: true })
    bucketName: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Metastore', required: true })
    metaStoreId: Types.ObjectId;

    @Prop({ required: true })
    permanentLink: string;

    @Prop({ required: true })
    uploadDate: Date;

    @Prop()
    createdAt?: Date;

    @Prop()
    updatedAt?: Date;
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);