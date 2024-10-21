import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PublicationService } from './publication.service';
import { MetastoreService } from '../metastore/metastore.service';
import { CreateMetastoreDto } from '../metastore/dto/create-metastore.dto';
import { UpdateMetastoreDto } from '../metastore/dto/update-metastore.dto';
import { PublicationDto } from './dto/publicatoin.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePublicationDto } from './dto/create-publication.dto';

@ApiTags("publications")
@Controller('publications')
export class PublicationController {
  constructor(
    private readonly publicationService: PublicationService,
    private readonly metastoreService: MetastoreService,
  ) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload a file with metadata',
    description: 'Upload a file along with its metadata. Creates both Publication and Metastore records.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreatePublicationDto,
    description: 'File and metadata information'
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'File uploaded successfully'
        },
        publication: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            fileName: {
              type: 'string',
              example: 'technical-docs/2024/document.pdf'
            },
            bucketName: {
              type: 'string',
              example: 'my-bucket'
            },
            metaStoreId: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            },
            permanentLink: {
              type: 'string',
              example: 'http://minio-server/my-bucket/technical-docs/2024/document.pdf'
            },
            uploadDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-10-16T10:00:00.000Z'
            }
          }
        },
        metadata: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            },
            description: {
              type: 'string',
              example: 'Technical documentation for Project X'
            },
            keyword: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['technical', 'documentation', 'guide']
            },
            type: {
              type: 'string',
              example: 'application/pdf'
            },
            size: {
              type: 'number',
              example: 1024
            },
            location: {
              type: 'string',
              example: 'technical-docs/2024'
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request'
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPublicationDto: CreatePublicationDto
  ) {
    console.log("file:", file);
    console.log("createPublicationDto:", createPublicationDto);
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Combine the file information with the DTO
    const combinedData = {
      ...createPublicationDto,
      size: file.size,
      type: file.mimetype,
    };

    const result = await this.publicationService.create(
      file,
      combinedData
    );

    return {
      message: 'File uploaded successfully',
      publication: result.publication,
      metadata: result.metadata
    };
  }

  @Post('bucket')
  @ApiOperation({ summary: 'Create a new bucket' })
  @ApiBody({
    schema: {
      properties: {
        bucketName: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Bucket created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createBucket(@Body('bucketName') bucketName: string) {
    await this.publicationService.createBucket(bucketName);
    return { message: 'Bucket created successfully' };
  }

  @Post('upload-nested')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file to a nested directory' })
  @ApiBody({
    type: CreateMetastoreDto, // Use type instead of schema
    description: 'File upload data for nested directory', // Optional description
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully to nested directory' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async uploadFileToNestedDirectory(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMetastoreDto: CreateMetastoreDto, // Use DTO directly here
    @Body('bucketName') bucketName: string,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    if (!bucketName) {
      const buckets = await this.publicationService.minioService.client.listBuckets();
      bucketName = buckets[0].name;
    }

    createMetastoreDto.location = createMetastoreDto.location
      ? `${createMetastoreDto.location}/${file.originalname}`
      : file.originalname;

    await this.publicationService.uploadFileToNestedDirectory(
      bucketName,
      createMetastoreDto.location,
      file.originalname,
      file.buffer,
      createMetastoreDto
    );

    return { message: 'File uploaded successfully to nested directory' };
  }


  @Get()
  @ApiOperation({ summary: 'Get all publications' })
  @ApiResponse({ status: 200, description: 'Return all publications' })
  async findAll() {
    return this.publicationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a publication by id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Return the publication' })
  @ApiResponse({ status: 404, description: 'Publication not found' })
  async findOne(@Param('id') id: string) {
    return this.publicationService.findOne(id);
  }

  @Get('metadata/:id')
  @ApiOperation({ summary: 'Get metadata for a publication' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Return the metadata' })
  @ApiResponse({ status: 404, description: 'Publication not found' })
  async getFileMetadata(@Param('id') id: string) {
    const publication = await this.publicationService.findOne(id);
    if (!publication) {
      throw new Error('Publication not found');
    }
    const metadata = await this.metastoreService.findOne(publication.metaStoreId.toString());
    return { metadata };
  }

  @Get('buckets/list')
  @ApiOperation({ summary: 'List buckets' })
  @ApiResponse({ status: 200, description: 'Return the list of buckets' })
  async listBuckets() {
    return this.publicationService.listBuckets();
  }

  @Get('buckets/locations')
  @ApiOperation({ summary: 'List locations' })
  @ApiResponse({ status: 200, description: 'Return the list of locations' })
  async listLocations() {
    return this.publicationService.listLocations();
  }

  @Get('files/list')
  @ApiOperation({ summary: 'List files in a bucket' })
  @ApiQuery({ name: 'path', required: false, type: 'string' })
  @ApiQuery({ name: 'bucketName', required: false, type: 'string' })
  @ApiResponse({ status: 200, description: 'Return the list of files' })
  async listFiles(@Query('path') @Query('bucketName') bucketName: string, path?: string,) {
    if (!bucketName) {
      const buckets = await this.publicationService.minioService.client.listBuckets();
      bucketName = buckets[0].name;
    }
    try {
      const files = await this.publicationService.listFiles(bucketName, path);
      return files;
    } catch (error) {
      throw new Error('Could not retrieve files');
    }
  }

  @Get('presigned-url')
  @ApiOperation({ summary: 'Generate a presigned URL for file download' })
  @ApiQuery({ name: 'fileName', required: true, type: 'string' })
  @ApiQuery({ name: 'bucketName', required: false, type: 'string' })
  @ApiQuery({ name: 'expiry', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'Return the presigned URL' })
  async generatePresignedUrl(
    @Query('fileName') fileName: string,
    @Query('bucketName') bucketName: string,
    @Query('expiry') expiry: number,
  ) {
    if (!bucketName) {
      const buckets = await this.publicationService.minioService.client.listBuckets();
      bucketName = buckets[0].name;
    }

    const presignedUrl = await this.publicationService.generatePresignedUrl(
      bucketName,
      fileName,
      expiry || 3600,
    );

    return { url: presignedUrl };
  }

  @Get('download/:id')
  @ApiOperation({ summary: 'Download a file' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'File download' })
  @ApiResponse({ status: 404, description: 'Publication not found' })
  @ApiResponse({ status: 500, description: 'Error generating download link' })
  async downloadFile(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const publication = await this.publicationService.findOne(id);
    if (!publication) {
      throw new Error('Publication not found');
    }

    try {
      const url = this.publicationService.generatePublicUrl(publication.bucketName, publication.fileName);
      return res.redirect(url);
    } catch (err) {
      res.status(500).json({ error: 'Error generating download link' });
    }
  }

  @Patch('metadata/:id')
  @ApiOperation({ summary: 'Update metadata for a publication by publication id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateMetastoreDto })
  @ApiResponse({ status: 200, description: 'Metadata updated successfully' })
  @ApiResponse({ status: 404, description: 'Publication not found' })
  async updateFileMetadata(
    @Param('id') id: string,
    @Body() updateMetadataDto: UpdateMetastoreDto,
  ) {
    const publication = await this.publicationService.findOne(id);
    if (!publication) {
      throw new Error('Publication not found');
    }
    const updatedMetadata = await this.publicationService.updateFileMetadata(
      publication.bucketName,
      publication.fileName,
      {
        ...updateMetadataDto,
        modified_date: new Date(),
      }
    );
    return { message: 'Metadata updated successfully', metadata: updatedMetadata };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'Publication not found' })
  async deleteFile(@Param('id') id: string) {
    await this.publicationService.delete(id);
    return { message: 'File deleted successfully' };
  }

}