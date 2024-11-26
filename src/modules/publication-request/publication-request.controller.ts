import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { PublicationRequestService } from './publication-request.service';
import { CreatePublicationRequestDto } from './dto/create-publication-request.dto';
import { UpdatePublicationRequestDto } from './dto/update-publication-request.dto';
import { PublicationRequest } from './schemas/publication-request.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from 'src/minio/minio.service';

@ApiBearerAuth()
@ApiTags('Publication Request')
@UseGuards(JwtAuthGuard)
@Controller('publication-request')
export class PublicationRequestController {
  constructor(
    private readonly publicationRequestService: PublicationRequestService,
    private readonly minioService: MinioService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new publication request' })
  @ApiResponse({
    status: 201,
    description: 'The publication request has been created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async createPublicationRequest(
    @Body() createPublicationRequestDto: CreatePublicationRequestDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let fileUrl: string[] | null = [];

    if (file) {
      const fileName = `publication-requests/${Date.now()}_${file.originalname}`;
      const result = await this.minioService.portalUploadFile(file, fileName);
      fileUrl.push(String(result));
    }

    console.log('======= in this bitch ===============');
    console.log(typeof fileUrl[0]);
    return this.publicationRequestService.createPublicationRequest(
      createPublicationRequestDto,
      fileUrl,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all publication requests' })
  @ApiResponse({ status: 200, description: 'List of publication requests.' })
  async findAll(@Request() req): Promise<PublicationRequest[]> {
    return this.publicationRequestService.findAll(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a publication request by ID' })
  @ApiResponse({ status: 200, description: 'Publication request details.' })
  @ApiResponse({ status: 404, description: 'Publication request not found.' })
  async findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<PublicationRequest> {
    return this.publicationRequestService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a publication request' })
  @ApiResponse({
    status: 200,
    description: 'Publication request has been updated.',
  })
  @ApiResponse({ status: 404, description: 'Publication request not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePublicationRequestDto,
    @Request() req,
  ): Promise<PublicationRequest> {
    return this.publicationRequestService.update(id, updateDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a publication request' })
  @ApiResponse({
    status: 200,
    description: 'Publication request has been deleted.',
  })
  @ApiResponse({ status: 404, description: 'Publication request not found.' })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.publicationRequestService.remove(id, req.user.sub);
  }
}
