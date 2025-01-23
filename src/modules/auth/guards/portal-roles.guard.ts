import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PORTAL_ROLES_KEY } from 'src/decorators/portal-roles.decorator';
import { PortalUserRole } from '../constants/portal-user-role';

@Injectable()
export class PortalRolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<PortalUserRole[]>(PORTAL_ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.some((role) => user?.role?.includes(role));
    }
}