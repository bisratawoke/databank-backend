import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreatePortalUserDto,
  PortalUserLoginDto,
} from '../dto/portal-user/portal-user.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { PortalUserService } from '../services/portal-user.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PortalUser } from '../schemas/portal-user.schema';

@ApiBearerAuth()
@ApiTags('Portal-Users')
@Controller('portal-users')
export class PortalUserController {
  constructor(
    private readonly portalUserService: PortalUserService,
    @InjectModel(PortalUser.name)
    private readonly portalUserModel: Model<PortalUser>,
  ) {}

  @Patch(':id')
  @UseInterceptors(FileInterceptor('authorizationLetter'))
  @ApiOperation({ summary: 'Update an existing portal user' })
  @ApiResponse({
    status: 200,
    description: 'The portal user has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'The portal user was not found.',
  })
  async updatePortalUser(
    @Param('id') id: string,
    @Body() updatePortalUserDto: any,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(pdf|doc|docx)$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 }) // 5MB
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    authorizationLetter?: Express.Multer.File,
  ) {
    // Find the portal user by ID
    const portalUser = await this.portalUserModel.findById(id);
    if (!portalUser) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Portal user not found.',
      };
    }

    // Update the portal user with the provided data
    if (updatePortalUserDto.fullName) {
      portalUser.fullName = updatePortalUserDto.fullName;
    }
    if (updatePortalUserDto.email) {
      portalUser.email = updatePortalUserDto.email;
    }
    if (updatePortalUserDto.phoneNumber) {
      portalUser.phoneNumber = updatePortalUserDto.phoneNumber;
    }
    if (updatePortalUserDto.mobileNumber) {
      portalUser.mobileNumber = updatePortalUserDto.mobileNumber;
    }
    if (authorizationLetter) {
      portalUser.authorizationLetter = {
        url: `uploads/${authorizationLetter.filename}`,
        path: authorizationLetter.path,
        filename: authorizationLetter.filename,
        mimetype: authorizationLetter.mimetype,
      };
    }

    await portalUser.save();

    return {
      statusCode: HttpStatus.OK,
      message: 'Portal user updated successfully.',
      data: portalUser,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get the current portal user information' })
  @ApiResponse({
    status: 200,
    description: 'The current portal user information is available',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access to the portal user information',
  })
  async getPortalUserInfo(@Request() req) {
    return this.portalUserService.getPortalUserInfo(req.user.sub);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('authorizationLetter'))
  @ApiOperation({ summary: 'Register a new portal user' })
  @ApiResponse({
    status: 201,
    description: 'The portal user has been successfully created',
  })
  async register(@Body() createPortalUserDto: CreatePortalUserDto) {
    console.log('=========== in register ===========');
    return this.portalUserService.create(createPortalUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a portal user' })
  @ApiResponse({
    status: 200,
    description: 'The portal user has been successfully logged in',
  })
  async login(@Body() loginDto: PortalUserLoginDto) {
    return this.portalUserService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  @ApiOperation({ summary: 'Get the dashboard data for the current user' })
  @ApiResponse({
    status: 200,
    description: 'The dashboard data has been successfully retrieved',
  })
  async getDashboard(@Request() req) {
    return this.portalUserService.getDataRequests(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-authorization-letter')
  @UseInterceptors(FileInterceptor('authorizationLetter'))
  @ApiOperation({
    summary: 'Update the authorization letter of the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'The authorization letter has been successfully updated',
  })
  async updateAuthorizationLetter(
    @Request() req,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(pdf|doc|docx)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.portalUserService.updateAuthorizationLetter(req.user.sub, file);
  }
}
