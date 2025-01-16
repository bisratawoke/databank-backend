import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export default class Chatter {
  @Prop({ required: true, type: Types.ObjectId })
  subject: String;

  @Prop({ required: false, type: [{ type: Types.ObjectId, ref: 'Message' }] })
  messages: Types.ObjectId[];
}

export const ChatterSchema = SchemaFactory.createForClass(Chatter);
