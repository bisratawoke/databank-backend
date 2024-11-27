import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  CreatePortalUserDto,
  PortalUserLoginDto,
} from '../dto/portal-user/portal-user.dto';
import { PortalUser } from '../schemas/portal-user.schema';
import { MinioService } from 'src/minio/minio.service';
import { PortalUserType } from '../constants/portal-user-role';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PortalUserService {
  constructor(
    @InjectModel(PortalUser.name) private portalUserModel: Model<PortalUser>,
    private jwtService: JwtService,
    private minioService: MinioService,
  ) { }

  async findOne(id: string): Promise<PortalUser> {
    return this.portalUserModel.findById(id);
  }

  async create(
    createPortalUserDto: CreatePortalUserDto,
    authorizationLetter?: Express.Multer.File,
  ): Promise<Partial<PortalUser>> {
    const { password, ...rest } = createPortalUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    this.validateUserTypeFields(createPortalUserDto);

    let authorizationLetterData = null;

    if (
      authorizationLetter &&
      (rest.userType === PortalUserType.COMPANY ||
        rest.userType === PortalUserType.NGO ||
        rest.userType === PortalUserType.FOREIGN_COMPANY)
    ) {
      const filename = `${uuidv4()}-${authorizationLetter.originalname}`;
      const path = `authorization-letters/${filename}`;

      const url = await this.minioService.portalUploadFile(
        authorizationLetter,
        path,
      );

      authorizationLetterData = {
        url,
        path,
        filename,
        mimetype: authorizationLetter.mimetype,
      };
    }

    const newPortalUser = new this.portalUserModel({
      ...rest,
      password: hashedPassword,
      authorizationLetter: authorizationLetterData,
    });

    const user = await newPortalUser.save();
    const { password: omittedPassword, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword
  }

  async login(loginDto: PortalUserLoginDto) {
    console.log("loginDto: ", loginDto);
    const user = await this.portalUserModel.findOne({ email: loginDto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('user: ', user);
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      roles: user.roles,
      userType: user.userType,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        fullName: user.fullName,
        companyName: user.companyName,
      },
    };
  }

  async updateAuthorizationLetter(userId: string, file: Express.Multer.File) {
    const user = await this.portalUserModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Delete old file if it exists
    if (user.authorizationLetter?.path) {
      await this.minioService.deleteFile(user.authorizationLetter.path);
    }

    const filename = `${uuidv4()}-${file.originalname}`;
    const path = `authorization-letters/${filename}`;
    const url = await this.minioService.portalUploadFile(file, path);

    user.authorizationLetter = {
      url,
      path,
      filename,
      mimetype: file.mimetype,
    };

    return user.save();
  }

  async getDataRequests(userId: string) {
    const user = await this.portalUserModel
      .findById(userId)
      .select('-password');

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Implement your data request fetching logic here
    // This is just a placeholder structure
    return {
      user,
      dataRequests: [], // Fetch from your data requests collection
    };
  }

  private validateUserTypeFields(dto: CreatePortalUserDto) {
    const isCompanyType = [
      PortalUserType.COMPANY,
      PortalUserType.NGO,
      PortalUserType.FOREIGN_COMPANY,
    ].includes(dto.userType);

    if (isCompanyType) {
      if (!dto.companyName) {
        throw new BadRequestException(
          'Company name is required for company type users',
        );
      }
      if (!dto.phoneNumber) {
        throw new BadRequestException(
          'Phone number is required for company type users',
        );
      }
    }

    if (dto.userType === PortalUserType.INDIVIDUAL && !dto.mobileNumber) {
      throw new BadRequestException(
        'Mobile number is required for individual users',
      );
    }
  }
}
