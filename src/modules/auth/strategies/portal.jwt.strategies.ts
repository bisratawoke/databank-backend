import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PortalUserService } from '../services/portal-user.service';

@Injectable()
export class PortalJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private portalUserService: PortalUserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('PORTAL_JWT_SECRET'),
    });
  }

  async validatePortalUser(payload: any) {
    const user = await this.portalUserService.findOne(payload.sub);
    if (!user || !user.isVerified) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
