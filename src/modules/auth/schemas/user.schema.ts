import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../constants/user-role';
import { Exclude } from 'class-transformer';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ type: [String], enum: UserRole, default: [] })
  roles: UserRole[];

  @Prop({ default: true })
  isEmailVerified: boolean;

  @Prop({ type: String, default: null })
  emailVerificationToken?: string;

  @Exclude()
  @Prop({ type: String, default: null })
  passwordResetToken?: string;

  @Prop({ type: Date, default: null })
  passwordResetExpires?: Date;

  @Prop({ type: String, default: null })
  refreshToken?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Department', default: null })
  department: Types.ObjectId;

  @Prop({ type: Date, default: null })
  lastLogin?: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ActivityLog' }] })
  activityLogs: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
