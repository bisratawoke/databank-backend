import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from '../modules/auth/services/user.service';
import { PortalUserService } from 'src/modules/auth/services/portal-user.service';
@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  constructor(
    private readonly userService: UserService,
    // private readonly PortalUserService: PortalUserService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('user in interceptor: ', user);

    if (!user) {
      throw new UnauthorizedException('No authenticated user found');
    }

    const fullUser = await this.userService.findOne(user.sub);
    if (!fullUser || !fullUser.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    request.user = fullUser;
    return next.handle();
  }
}
