import { Injectable } from '@nestjs/common';
import { MinioService } from 'src/minio/minio.service';
import { Readable } from 'stream';

@Injectable()
export class PublicationService {
    constructor(
        private readonly minioService: MinioService
    ) { }

    async uploadFileFromBuffer(bucketName: string, fileName: string, fileBuffer: Buffer) {
        try {
            const metaData = {
                'Content-Type': 'application/octet-stream',
            };

            // Create a readable stream from the buffer
            const stream = new Readable();
            stream.push(fileBuffer);
            stream.push(null); // End of stream

            await this.minioService.client.putObject(bucketName, fileName, stream, fileBuffer.length, metaData);
            console.log('File uploaded successfully using buffer.');
        } catch (err) {
            console.error('Error uploading file:', err);
            throw err;
        }
    }

    async createBucket(bucketName: string) {
        try {
            const bucketExists = await this.minioService.client.bucketExists(bucketName);

            if (!bucketExists) {
                await this.minioService.client.makeBucket(bucketName, 'us-east-1');
                console.log(`Bucket ${bucketName} created successfully.`);
            } else {
                console.log(`Bucket ${bucketName} already exists.`);
            }
        } catch (err) {
            console.error('Error creating bucket:', err);
            throw err;
        }
    }

    //promise -based approach
    async listFiles(bucketName: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const objectsList = [];
            const stream = this.minioService.client.listObjectsV2(bucketName, '', true);

            stream.on('data', (obj) => objectsList.push(obj));
            stream.on('end', () => resolve(objectsList));
            stream.on('error', (err) => reject(err));
        });
    }


    async deleteFile(bucketName: string, fileName: string) {
        try {
            await this.minioService.client.removeObject(bucketName, fileName);
            console.log(`File ${fileName} deleted successfully`);
        } catch (err) {
            console.error('Error deleting file:', err);
            throw err;
        }
    }
    // Generate a pre-signed URL for downloading files
    async generatePresignedUrl(bucketName: string, filePath: string, expirySeconds: number = 3600) {
        try {
            const url = await this.minioService.client.presignedGetObject(bucketName, filePath, expirySeconds);
            console.log(`Generated presigned URL: ${url}`);
            return url;
        } catch (err) {
            console.error('Error generating presigned URL:', err);
            throw err;
        }
    }

    // Generate a public URL for a file in the specified bucket
    generatePublicUrl(bucketName: string, filePath: string): string {
        const minioServerUrl = `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
        return `${minioServerUrl}/${bucketName}/${filePath}`;
    }

    // Upload a file to a nested directory (example: uploads/images/file.png)
    async uploadFileToNestedDirectory(bucketName: string, directory: string, fileName: string, fileBuffer: Buffer) {
        const filePath = `${directory}/${fileName}`;  // Nesting the file in a directory
        await this.uploadFileFromBuffer(bucketName, filePath, fileBuffer);
    }
}
