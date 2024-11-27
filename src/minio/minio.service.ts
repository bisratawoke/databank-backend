import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  public minioClient: Minio.Client;
  private bucketName: string;

  async onModuleInit() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: Number(process.env.MINIO_PORT),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
    this.bucketName = process.env.MINIO_PORTAL_BUCKET;
  }

  get client(): Minio.Client {
    return this.minioClient;
  }

  async uploadFileFromBuffer(
    bucketName: string,
    fileName: string,
    fileBuffer: Buffer,
  ) {
    await this.minioClient.putObject(bucketName, fileName, fileBuffer);
  }

  async generatePublicUrl(
    bucketName: string,
    filePath: string,
  ): Promise<string> {
    return `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${filePath}`;
  }

  async portalUploadFile(
    file: Express.Multer.File,
    path: string,
  ): Promise<string> {
    const metadata: Minio.ItemBucketMetadata = {
      contentType: file.mimetype,
    };
    await this.minioClient.putObject(
      this.bucketName,
      path,
      file.buffer,
      file.size,
      metadata,
    );

    return `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${this.bucketName}/${path}`;
  }

  async deleteFile(path: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, path);
  }
}
