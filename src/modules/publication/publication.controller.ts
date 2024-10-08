import { Body, Controller, Delete, Get, Param, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from 'src/minio/minio.service';

@Controller('publications')
export class PublicationController {

}
