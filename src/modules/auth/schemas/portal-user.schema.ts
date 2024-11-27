import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PortalUserType } from '../constants/portal-user-role';
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

  @Prop({
    type: [String],
    default: [UserRole.PORTAL_USER],
    validate: {
      validator: (roles: UserRole[]) => {
        return roles.length === 1 && roles.includes(UserRole.PORTAL_USER);
      },
      message: 'Only PORTAL_USER role is allowed.',
    },
  })
  roles: UserRole[];

}

export const PortalUserSchema = SchemaFactory.createForClass(PortalUser);
