import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../constants/user-role';

// export interface IUser {
//     _id?: string;
//     email: string;
//     password: string;
//     firstName: string;
//     lastName: string;
//     roles: UserRole[];
//     isEmailVerified: boolean;
//     emailVerificationToken?: string;
//     passwordResetToken?: string;
//     passwordResetExpires?: Date;
//     refreshToken?: string;
//     isActive: boolean;
//     department?: string;
//     lastLogin?: Date;
//     activityLogs: Types.ObjectId[];
// }


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

    @Prop({ default: false })
    isEmailVerified: boolean;

    @Prop({ type: String, default: null })
    emailVerificationToken?: string;

    @Prop({ type: String, default: null })
    passwordResetToken?: string;

    @Prop({ type: Date, default: null })
    passwordResetExpires?: Date;

    @Prop({ type: String, default: null })
    refreshToken?: string;

    @Prop({ default: false })
    isActive: boolean;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Department' }], default: null })
    department?: Types.ObjectId;

    @Prop({ type: Date, default: null })
    lastLogin?: Date;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'ActivityLog' }] })
    activityLogs: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
