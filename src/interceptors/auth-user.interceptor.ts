import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from '../modules/auth/services/user.service';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  constructor(private readonly userService: UserService) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    console.log("request in interceptor: ", request)
    const user = request.user;
    console.log("user in interceptor: ", user)

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