import { SetMetadata } from '@nestjs/common';
import { PortalUserRole } from 'src/modules/auth/constants/portal-user-role';

export const PORTAL_ROLES_KEY = 'roles';
export const PortalRoles = (...roles: PortalUserRole[]) => SetMetadata(PORTAL_ROLES_KEY, roles);
