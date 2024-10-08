import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
    public minioClient: Minio.Client;

    async onModuleInit() {
        this.minioClient = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT,
            port: Number(process.env.MINIO_PORT),
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY,
        });
        console.log("minio initialized: ", this.minioClient);
    }

    // Add methods for interacting with MinIO (e.g., upload, download)
    async uploadFileFromBuffer(bucketName: string, fileName: string, fileBuffer: Buffer) {
        await this.minioClient.putObject(bucketName, fileName, fileBuffer);
    }

    async generatePublicUrl(bucketName: string, filePath: string): Promise<string> {
        return `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${filePath}`;
    }

}
