import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class UserGuard extends AuthGuard('user') {
    constructor(private readonly reflector: Reflector) {
        super();
    }
    handleRequest(
        err: any,
        user: any,
        _info: any,
        context: ExecutionContext,
        _status?: any,
    ): any {
        const authRequired = this.reflector.get(
            'authRequired',
            context.getHandler(),
        );
        if ((err || !user) && authRequired !== false) {
            throw new UnauthorizedException();
        }

        return user;
    }
}