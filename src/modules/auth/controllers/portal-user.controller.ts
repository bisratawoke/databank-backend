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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
  CreatePortalUserDto,
  PortalUserLoginDto,
} from '../dto/portal-user/portal-user.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { PortalUserService } from '../services/portal-user.service';

@ApiBearerAuth()
@ApiTags('Portal-Users')
@Controller('portal-users')
export class PortalUserController {
  constructor(private readonly portalUserService: PortalUserService) { }

  @Post('register')
  @UseInterceptors(FileInterceptor('authorizationLetter'))
  @ApiOperation({ summary: 'Register a new portal user' })
  @ApiResponse({
    status: 201,
    description: 'The portal user has been successfully created',
  })
  async register(
    @Body() createPortalUserDto: CreatePortalUserDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(pdf|doc|docx)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    authorizationLetter?: Express.Multer.File,
  ) {
    return this.portalUserService.create(
      createPortalUserDto,
      authorizationLetter,
    );
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
