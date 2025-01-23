import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { UserService } from './user.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { plainToClass } from 'class-transformer';
import { User } from '../schemas/user.schema';
import { userToDto } from '../dto/user/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    // private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  private async validateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findOneWithCredentials(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isEmailVerified) {
        throw new UnauthorizedException('Please verify your email first');
      }
      if (!user.isActive) {
        throw new UnauthorizedException('Account is inactive');
      }
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user._id.toString(),
      roles: user.roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '24h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    // Update user's refresh token
    await this.usersService.update(user._id.toString(), {
      refreshToken: await bcrypt.hash(refreshToken, 10),
      lastLogin: new Date(),
    });

    return {
      user: userToDto(user),
      auth: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findOneWithCredentials(
        decoded.email,
      );

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token1');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token2');
      }

      const payload = {
        email: user.email,
        sub: user._id.toString(),
        roles: user.roles,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '24h',
      });
      return { access_token: accessToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token3');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    await this.usersService.update(user._id.toString(), {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 3600000), // 1 hour
    });

    // await this.mailService.sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const hashedToken = await bcrypt.hash(resetPasswordDto.token, 10);
    const user = await this.usersService.findByPasswordResetToken(hashedToken);

    if (!user || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.usersService.update(user.id, {
      password: await bcrypt.hash(resetPasswordDto.newPassword, 10),
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByEmailVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.usersService.update(user._id.toString(), {
      isEmailVerified: true,
      emailVerificationToken: null,
      isActive: true,
    });
  }
}
