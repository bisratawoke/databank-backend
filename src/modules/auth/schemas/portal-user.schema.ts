import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PortalUserType } from '../constants/portal-user-type';
import { UserRole } from '../constants/user-role';

@Schema({ timestamps: true })
export class PortalUser extends Document {
  @Prop({ required: true, enum: PortalUserType })
  userType: PortalUserType;

  @Prop({ required: true })
  fullName: string;

  @Prop({
    required: function () {
      return (
        this.userType === PortalUserType.COMPANY ||
        this.userType === PortalUserType.NGO ||
        this.userType === PortalUserType.FOREIGN_COMPANY
      );
    },
  })
  companyName: string;

  @Prop({
    type: Object,
    required: function () {
      return (
        this.userType === PortalUserType.COMPANY ||
        this.userType === PortalUserType.NGO ||
        this.userType === PortalUserType.FOREIGN_COMPANY
      );
    },
  })
  authorizationLetter: {
    url: string;
    path: string;
    filename: string;
    mimetype: string;
  };

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    type: String, required: function () {
      return (
        this.userType !== PortalUserType.INDIVIDUAL
      )
    }
  })
  phoneNumber: string;

  @Prop({
    type: String, required: function () {
      return (
        this.userType === PortalUserType.INDIVIDUAL
      )
    }
  })
  mobileNumber: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: UserRole.PORTAL_USER })
  role: string;
}

export const PortalUserSchema = SchemaFactory.createForClass(PortalUser);
