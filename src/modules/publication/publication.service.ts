import { Injectable } from '@nestjs/common';
import { CopyConditions } from 'minio';
import { MinioService } from 'src/minio/minio.service';
import { Readable } from 'stream';

@Injectable()
export class PublicationService {
  constructor(private readonly minioService: MinioService) {}

  async createBucket(bucketName: string) {
    try {
      const bucketExists =
        await this.minioService.client.bucketExists(bucketName);

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

  async getFileMetadata(bucketName: string, fileName: string) {
    try {
      const stat = await this.minioService.client.statObject(
        bucketName,
        fileName,
      );
      return stat.metaData;
    } catch (err) {
      console.error('Error getting file metadata:', err);
      throw err;
    }
  }
  async generatePresignedUrl(
    bucketName: string,
    filePath: string,
    expirySeconds: number = 3600,
  ) {
    try {
      const url = await this.minioService.client.presignedGetObject(
        bucketName,
        filePath,
        expirySeconds,
      );
      console.log(`Generated presigned URL: ${url}`);
      return url;
    } catch (err) {
      console.error('Error generating presigned URL:', err);
      throw err;
    }
  }

  generatePublicUrl(bucketName: string, filePath: string): string {
    const minioServerUrl = `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
    return `${minioServerUrl}/${bucketName}/${filePath}`;
  }

  async listFiles(bucketName: string, path: string): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      const objectsList = [];
      try {
        const bucketExists =
          await this.minioService.client.bucketExists(bucketName);
        if (!bucketExists) {
          return reject(new Error(`Bucket ${bucketName} does not exist.`));
        }

        const stream = this.minioService.client.listObjectsV2(
          bucketName,
          path,
          true,
        );

        stream.on('data', async (obj) => {
          try {
            objectsList.push(obj);
          } catch (err) {
            console.error(`Error getting metadata for ${obj.name}:`, err);
            objectsList.push(obj);
          }
        });

        stream.on('end', () => resolve(objectsList));
        stream.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }

  async uploadFileFromBuffer(
    bucketName: string,
    fileName: string,
    fileBuffer: Buffer,
    metadata: Record<string, string> = {},
  ) {
    try {
      const metaData = {
        'Content-Type': 'application/octet-stream',
        ...metadata, // Merge custom metadata with default metadata
      };

      // Create a readable stream from the buffer
      const stream = new Readable();
      stream.push(fileBuffer);
      stream.push(null); // End of stream

      // Upload file with metadata
      await this.minioService.client.putObject(
        bucketName,
        fileName,
        stream,
        fileBuffer.length,
        metaData,
      );
      console.log('File uploaded successfully with metadata.');
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  }

  async updateFileMetadata(
    bucketName: string,
    fileName: string,
    newMetadata: Record<string, string>,
  ) {
    try {
      // First, get the existing object's data
      const stat = await this.minioService.client.statObject(
        bucketName,
        fileName,
      );

      // Create a temporary buffer to store the file content
      const fileStream = await this.minioService.client.getObject(
        bucketName,
        fileName,
      );
      const chunks: any[] = [];

      for await (const chunk of fileStream) {
        chunks.push(chunk);
      }

      const fileBuffer = Buffer.concat(chunks);

      // Prepare the new metadata
      const metaData = {
        'Content-Type':
          stat.metaData['content-type'] || 'application/octet-stream',
        ...newMetadata,
      };

      // Create a readable stream from the buffer
      const stream = new Readable();
      stream.push(fileBuffer);
      stream.push(null);

      // Remove the old object
      await this.minioService.client.removeObject(bucketName, fileName);

      // Upload the object with new metadata
      await this.minioService.client.putObject(
        bucketName,
        fileName,
        stream,
        fileBuffer.length,
        metaData,
      );

      console.log(`Metadata updated for file ${fileName}`);
    } catch (err) {
      console.error('Error updating file metadata:', err);
      throw err;
    }
  }

  async uploadFileToNestedDirectory(
    bucketName: string,
    directory: string,
    fileName: string,
    fileBuffer: Buffer,
    metadata: Record<string, string> = {},
  ) {
    const filePath = `${directory}/${fileName}`;
    await this.uploadFileFromBuffer(bucketName, filePath, fileBuffer, metadata);
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
}
