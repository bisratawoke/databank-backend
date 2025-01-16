import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export default class Message extends Document {
  @Prop({ required: true })
  message: string;

  @Prop({ required: true, type: Types.ObjectId })
  from: Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
