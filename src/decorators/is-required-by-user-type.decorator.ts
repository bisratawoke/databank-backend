import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { PortalUserType } from '../modules/auth/constants/portal-user-role';

export function IsRequiredByUserType(
  userTypes: PortalUserType[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isRequiredByUserType',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const userType = (args.object as any).userType;

          if (userTypes.includes(userType)) {
            return value !== undefined && value !== null && value !== '';
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${propertyName} is required for user types: ${userTypes.join(', ')}`;
        },
      },
    });
  };
}
