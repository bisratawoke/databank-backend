import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Notifire extends Document {
  @ApiProperty({
    description: 'Message of the notifire',
    example: 'Notification message',
  })
  @Prop({ required: true, unique: true, type: String })
  message: string;

  @ApiProperty({
    description: 'Whether the notification has been seen',
    example: false,
  })
  @Prop({ required: true, type: Boolean })
  seen: boolean;

  @ApiProperty({
    description: 'User ID associated with the notifire',
    example: '60d21b4667d0d8992e610c85',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: Types.ObjectId;

  @ApiProperty({
    description: 'Timestamp when the notifire was created',
    example: new Date().toISOString(),
  })
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const NotifireSchema = SchemaFactory.createForClass(Notifire);
