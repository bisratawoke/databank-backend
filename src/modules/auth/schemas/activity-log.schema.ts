import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ActivityLog extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    action: string;

    @Prop({ type: Object, default: null })
    details?: any;

    @Prop({ type: String, default: null })
    ipAddress?: string;

    @Prop({ type: String, default: null })
    userAgent?: string;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
