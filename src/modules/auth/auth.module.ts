import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategies';
import { AuthController } from './controllers/auth.controller';
import { UserService } from './services/user.service';
import { UsersController } from './controllers/user.controller';
import { ActivityLogService } from './services/activity-log.service';
import { AdminInitializationService } from './services/admin-init.service';
import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLog, ActivityLogSchema } from './schemas/activity-log.schema';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: ActivityLog.name, schema: ActivityLogSchema },
        ]),
        ConfigModule.forRoot({ isGlobal: true }),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1d' },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AdminInitializationService, AuthService, UserService, ActivityLogService, JwtStrategy],
    controllers: [AuthController, UsersController],
    exports: [AuthService, UserService, ActivityLogService],
})
export class AuthModule { }
