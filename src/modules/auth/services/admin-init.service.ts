import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
// import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '../constants/user-role';
import { User } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AdminInitializationService implements OnApplicationBootstrap {
  constructor(
    // private readonly prisma: PrismaService,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly configService: ConfigService,
  ) { }

  async onApplicationBootstrap() {
    await this.initializeAdminIfNeeded();
  }

  private async initializeAdminIfNeeded() {
    const adminExists = await this.userModel.findOne({
      roles: UserRole.ADMIN,
    });

    if (!adminExists) {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      const adminPassword = this.configService.get<string>(
        'ADMIN_INITIAL_PASSWORD',
      );

      if (!adminEmail || !adminPassword) {
        console.warn(
          'WARNING: No admin account exists and no admin credentials provided in environment variables. ' +
          'System will generate temporary credentials.',
        );

        const tempPassword = crypto.randomBytes(16).toString('hex');
        const tempEmail = `admin-${crypto.randomBytes(4).toString('hex')}@temporary.com`;

        await this.createAdminAccount(tempEmail, tempPassword);

        console.log('\n=== TEMPORARY ADMIN CREDENTIALS ===');
        console.log(`Email: ${tempEmail}`);
        console.log(`Password: ${tempPassword}`);
        console.log(
          'IMPORTANT: Change these credentials immediately after first login!\n',
        );
      } else {
        await this.createAdminAccount(adminEmail, adminPassword);
        console.log(`Admin account created with email: ${adminEmail}`);
      }
    }
  }

  private async createAdminAccount(email: string, password: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = new this.userModel({
      email,
      password: hashedPassword,
      roles: [UserRole.ADMIN],
      isEmailVerified: true,
      firstName: 'System',
      lastName: 'Administrator',
      createdAt: new Date(),
      isActive: true,
    });

    return newAdmin.save();
  }
}
