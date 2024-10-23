import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    // handleRequest(err, user, info) {
    //     console.log('JwtAuthGuard error:', err);
    //     console.log('JwtAuthGuard user:', user);
    //     console.log('JwtAuthGuard info:', info);
    //     if (err || !user) {
    //         throw err || new UnauthorizedException();
    //     }
    //     return user;
    // }
}