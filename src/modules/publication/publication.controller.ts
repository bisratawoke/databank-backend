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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from 'src/minio/minio.service';
import { PublicationService } from './publication.service';
import { Multer } from 'multer';
import { Response } from 'express';

@Controller('publications')
export class PublicationController {
  constructor(
    private readonly minioService: MinioService,
    private readonly publicationService: PublicationService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Multer.File,
    @Body('metadata') metadata: string,
    @Body('directory') directory: string,
  ) {
    const buckets = await this.minioService.minioClient.listBuckets();
    const bucketName = buckets[0].name;

    const fileBuffer = file.buffer;
    const parsedMetadata = JSON.parse(metadata);

    console.log(`Uploading file ${file.originalname} to bucket ${bucketName}`);

    const filePath = directory
      ? `${directory}/${file.originalname}`
      : file.originalname;

    // Upload the file with metadata
    await this.publicationService.uploadFileFromBuffer(
      bucketName,
      filePath,
      fileBuffer,
      parsedMetadata,
    );

    return {
      message: 'File uploaded successfully',
      metadata: parsedMetadata,
    };
  }

  @Get('metadata/:fileName')
  async getFileMetadata(@Param('fileName') fileName: string) {
    const bucketName = 'mybucket';
    const metadata = await this.publicationService.getFileMetadata(
      bucketName,
      fileName,
    );
    return { metadata };
  }

  @Patch('metadata/:fileName')
  async updateFileMetadata(
    @Param('fileName') fileName: string,
    @Body('metadata') metadata: string,
  ) {
    const bucketName = 'mybucket';
    const parsedMetadata = JSON.parse(metadata);
    await this.publicationService.updateFileMetadata(
      bucketName,
      fileName,
      parsedMetadata,
    );
    return { message: 'Metadata updated successfully' };
  }

  // Other existing methods remain the same...
  @Get()
  async listFiles(@Query('path') path: string) {
    const bucketName = 'mybucket';
    try {
      console.log(path);
      const files = await this.publicationService.listFiles(bucketName, path);
      return files;
    } catch (error) {
      throw new Error('Could not retrieve files');
    }
  }

  @Get('presigned-url')
  async generatePresignedUrl(
    @Query('fileName') fileName: string,
    @Query('directory') directory: string,
    @Query('expiry') expiry: number,
  ) {
    const buckets = await this.minioService.minioClient.listBuckets();
    const bucketName = buckets[0].name;

    const filePath = directory ? `${directory}/${fileName}` : fileName;
    const presignedUrl = await this.publicationService.generatePresignedUrl(
      bucketName,
      filePath,
      expiry || 3600,
    );

    return { url: presignedUrl };
  }

  @Get('download/:fileName')
  async downloadFile(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const bucketName = 'mybucket';

    try {
      const url = await this.minioService.generatePublicUrl(
        bucketName,
        fileName,
      );
      console.log('url: ' + url);
      return res.redirect(url);
    } catch (err) {
      res.status(500).json({ error: 'Error generating download link' });
    }
  }

  @Delete(':fileName')
  async deleteFile(@Param('fileName') fileName: string) {
    const bucketName = 'mybucket';
    await this.publicationService.deleteFile(bucketName, fileName);
    return { message: 'File deleted successfully' };
  }
}
