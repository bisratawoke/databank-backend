import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { UserService } from './user.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { plainToClass } from 'class-transformer';
import { UserResponseDto } from '../dto/login-response.dto';


@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
        // private readonly mailService: MailService,
        private readonly configService: ConfigService,
    ) { }

    private async generateAccessToken(user: any) {
        return this.jwtService.signAsync({
            email: user.email,
            sub: user.id,
            roles: user.roles,
        });
    }

    private async generateRefreshToken(user: any) {
        return this.jwtService.signAsync(
            { sub: user.id },
            {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            },
        );
    }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isEmailVerified) {
            throw new UnauthorizedException('Please verify your email first');
        }

        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(user),
            this.generateRefreshToken(user),
        ]);

        await this.usersService.update(user.id, {
            lastLogin: new Date(),
            refreshToken: await bcrypt.hash(refreshToken, 10),
        });

        const userResponse = plainToClass(UserResponseDto, user, {
            excludeExtraneousValues: true
        });

        return {
            user: userResponse,
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

            const user = await this.usersService.findOne(decoded.sub);
            if (!user || !user.refreshToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
            if (!isValid) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const accessToken = await this.generateAccessToken(user);
            return { access_token: accessToken };
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(resetToken, 10);

        await this.usersService.update(user.id, {
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

        await this.usersService.update(user.id, {
            isEmailVerified: true,
            emailVerificationToken: null,
        });
    }
}