import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PortalUserController } from './controllers/portal-user.controller';
import { PortalUser, PortalUserSchema } from './schemas/portal-user.schema';
import { PortalUserService } from './services/portal-user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioModule } from 'src/minio/minio.module';
import { PortalJwtStrategy } from './strategies/portal.jwt.strategies';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PortalUser.name, schema: PortalUserSchema },
    ]),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    MinioModule,
  ],
  providers: [PortalUserService, PortalJwtStrategy],
  controllers: [PortalUserController],
  exports: [PortalUserService],
})
export class PortalUserModule {}
