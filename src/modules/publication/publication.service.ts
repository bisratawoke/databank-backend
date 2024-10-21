import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MinioService } from 'src/minio/minio.service';
import { Readable } from 'stream';
import { Publication, PublicationDocument } from './schemas/publication.schema';
import { MetastoreService } from '../metastore/metastore.service';
import { PublicationDto } from './dto/publicatoin.dto';
import { CreateMetastoreDto } from '../metastore/dto/create-metastore.dto';
import { CreatePublicationDto } from './dto/create-publication.dto';

@Injectable()
export class PublicationService {
  constructor(
    @InjectModel(Publication.name) private publicationModel: Model<PublicationDocument>,
    public readonly minioService: MinioService,
    private readonly metastoreService: MetastoreService
  ) { }



  async create(
    file: Express.Multer.File,
    createPublicationDto: CreatePublicationDto
  ): Promise<{ publication: Publication; metadata: any }> {
    // 1. Get bucket name
    const buckets = await this.minioService.client.listBuckets();
    const bucketName = buckets[0].name;

    // 2. Prepare file path
    const filePath = createPublicationDto.location
      ? `${createPublicationDto.location}/${file.originalname}`
      : file.originalname;

    // 3. Upload file to MinIO
    await this.uploadFileToMinio(
      bucketName,
      filePath,
      file.buffer,
      file.mimetype
    );

    // 4. Generate permanent link
    const permanentLink = this.generatePublicUrl(bucketName, filePath);

    // 5. Create metadata in Metastore
    const metastoreDoc = await this.metastoreService.create({
      title: createPublicationDto.title,
      description: createPublicationDto.description,
      keyword: createPublicationDto.keyword,
      type: file.mimetype,
      size: file.size,
      location: filePath,
      modified_date: createPublicationDto.modified_date,
      created_date: createPublicationDto.created_date
    });

    // 6. Create publication document
    const newPublication = new this.publicationModel({
      fileName: filePath,
      bucketName: bucketName,
      metaStoreId: metastoreDoc._id,
      permanentLink: permanentLink,
      uploadDate: new Date()
    });

    const savedPublication = await newPublication.save();

    // 7. Return both publication and metadata
    return {
      publication: savedPublication,
      metadata: metastoreDoc
    };
  }

  async findAll(): Promise<Publication[]> {
    return this.publicationModel.find().exec();
  }

  async findOne(id: string): Promise<Publication> {
    const publication = await this.publicationModel.findById(id).exec();
    if (!publication) {
      throw new NotFoundException('Publication not found');
    }
    if (publication && publication.metaStoreId) {
      const metadata = await this.metastoreService.findOne(publication.metaStoreId.toString());
      return { ...publication.toObject(), metaStoreId: new Types.ObjectId(metadata._id), };
    }
    return publication.toJSON();
  }

  async delete(id: string): Promise<Publication> {
    const publication = await this.publicationModel.findByIdAndDelete(id).exec();
    if (publication) {
      await this.minioService.client.removeObject(publication.bucketName, publication.fileName);
      if (publication.metaStoreId) {
        await this.metastoreService.remove(publication.metaStoreId.toString());
      }
    }
    return publication;
  }

  //! Minio Related Methods

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

  async listBuckets() {
    const buckets = await this.minioService.client.listBuckets();
    return buckets;
  }
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

  generatePublicUrl(bucketName: string, filePath: string): string {
    const minioServerUrl = `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
    return `${minioServerUrl}/${bucketName}/${filePath}`;
  }

  async listFiles(bucketName: string, path?: string): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      const objectsList = [];
      try {
        const bucketExists = await this.minioService.client.bucketExists(bucketName);
        if (!bucketExists) {
          return reject(new Error(`Bucket ${bucketName} does not exist.`));
        }

        if (!path) {
          path = '';
        }
        const stream = this.minioService.client.listObjectsV2(bucketName, path, true);

        stream.on('data', async (obj) => {
          objectsList.push(obj);
        });

        stream.on('end', () => resolve(objectsList));
        stream.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }

  async listLocations(): Promise<string[]> {
    const buckets = await this.minioService.client.listBuckets();
    const locations = new Set<string>();

    for (const bucket of buckets) {
      const stream = this.minioService.client.listObjects(bucket.name, '', true);

      for await (const item of stream) {
        const key = item.name;
        const parts = key.split('/');
        if (parts.length > 1) {
          // Add all intermediate "directories"
          for (let i = 1; i < parts.length; i++) {
            locations.add(parts.slice(0, i).join('/'));
          }
        }
      }
    }

    return Array.from(locations).sort();
  }

  async uploadFileFromBuffer(bucketName: string, fileName: string, fileBuffer: Buffer, metadata: any) {
    try {
      const stream = new Readable();
      stream.push(fileBuffer);
      stream.push(null);

      await this.minioService.client.putObject(bucketName, fileName, stream, fileBuffer.length);
      console.log('File uploaded successfully.');

      // Create metadata in Metastore
      const metastoreId = await this.metastoreService.create(metadata);

      // Create or update Publication document
      await this.publicationModel.findOneAndUpdate(
        { bucketName, fileName },
        {
          bucketName,
          fileName,
          permanentLink: this.generatePublicUrl(bucketName, fileName),
          uploadDate: new Date(),
          metastoreId,
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  }

  async updateFileMetadata(bucketName: string, fileName: string, newMetadata: any) {
    try {
      const publication = await this.publicationModel.findOne({ bucketName, fileName });
      if (!publication) {
        throw new Error('Publication not found');
      }

      if (publication.metaStoreId) {
        await this.metastoreService.update(publication.metaStoreId.toString(), newMetadata);
      } else {
        const newMetastore = await this.metastoreService.create(newMetadata);
        publication.metaStoreId = new Types.ObjectId(newMetastore._id);
        await publication.save();
      }

      console.log(`Metadata updated for file ${fileName}`);
    } catch (err) {
      console.error('Error updating file metadata:', err);
      throw err;
    }
  }

  async uploadFileToNestedDirectory(bucketName: string, directory: string, fileName: string, fileBuffer: Buffer, metadata: any) {
    const filePath = `${directory}/${fileName}`;
    await this.uploadFileFromBuffer(bucketName, filePath, fileBuffer, metadata);
  }

  async deleteFile(bucketName: string, fileName: string) {
    try {
      await this.minioService.client.removeObject(bucketName, fileName);
      console.log(`File ${fileName} deleted successfully from MinIO`);

      // Remove from Publication schema and delete associated metadata
      const publication = await this.publicationModel.findOneAndDelete({ bucketName, fileName });
      if (publication && publication.metaStoreId) {
        await this.metastoreService.remove(publication.metaStoreId.toString());
        console.log(`Metadata for file ${fileName} deleted successfully`);
      }
      console.log(`File ${fileName} deleted successfully from Publication schema`);
    } catch (err) {
      console.error('Error deleting file:', err);
      throw err;
    }
  }

  private async uploadFileToMinio(bucketName: string, fileName: string, fileBuffer: Buffer, contentType: string): Promise<void> {
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);
    await this.minioService.client.putObject(bucketName, fileName, stream, fileBuffer.length);
  }
}