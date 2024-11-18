import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MinioService } from 'src/minio/minio.service';
import { Readable } from 'stream';
import { Publication, PublicationDocument } from './schemas/publication.schema';
import { MetastoreService } from '../metastore/metastore.service';
import { PublicationDto } from './dto/publicatoin.dto';
import { CreateMetastoreDto } from '../metastore/dto/create-metastore.dto';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { populate } from 'dotenv';

@Injectable()
export class PublicationService {
  constructor(
    @InjectModel(Publication.name)
    private publicationModel: Model<PublicationDocument>,
    public readonly minioService: MinioService,
    private readonly metastoreService: MetastoreService,
  ) {}

  async create(
    file: Express.Multer.File,
    createPublicationDto: CreatePublicationDto,
  ): Promise<{ publication: Publication; metadata: any }> {
    // 1. Get bucket name
    const buckets = await this.minioService.client.listBuckets();

    if (
      !buckets.find((bucket) => bucket.name === createPublicationDto.bucketName)
    ) {
      throw new NotFoundException(
        `Bucket ${createPublicationDto.bucketName} not found. Create the Bucket first.`,
      );
    }
    const bucketName = createPublicationDto.bucketName;

    const filePath = createPublicationDto.location
      ? `${createPublicationDto.location}/${file.originalname}`
      : file.originalname;

    await this.uploadFileToMinio(
      bucketName,
      filePath,
      file.buffer,
      file.mimetype,
    );

    const permanentLink = this.generatePublicUrl(bucketName, filePath);

    const metastoreDoc = await this.metastoreService.create({
      title: createPublicationDto.title,
      description: createPublicationDto.description,
      keyword: createPublicationDto.keyword,
      type: file.mimetype,
      size: file.size,
      location: filePath,
      modified_date: createPublicationDto.modified_date,
      created_date: createPublicationDto.created_date,
    });

    const newPublication = new this.publicationModel({
      fileName: filePath,
      bucketName: bucketName,
      metaStoreId: metastoreDoc._id,
      permanentLink: permanentLink,
      uploadDate: new Date(),
      department: createPublicationDto.department,
      category: createPublicationDto.category,
      publicationType: createPublicationDto.publicationType,
    });

    const savedPublication = await newPublication.save();

    return {
      publication: savedPublication,
      metadata: metastoreDoc,
    };
  }

  async findAll(): Promise<Partial<Publication>[] | Publication[]> {
    return this.publicationModel
      .find()
      .populate({ path: 'metaStoreId' })
      .populate('department')
      .populate('category')
      .exec()
      .then((publications) =>
        publications.map((pub) => {
          const publicationObj = pub.toObject();
          const { metaStoreId, ...rest } = publicationObj;
          return {
            ...rest,
            metadata: metaStoreId,
          };
        }),
      );
  }

  async findOne(id: string): Promise<Partial<PublicationDto>> {
    const publication = await this.publicationModel.findById(id).exec();

    if (!publication) {
      throw new NotFoundException('Publication not found');
    }

    const publicationObj = publication.toObject();

    if (publication.metaStoreId) {
      const metadata = await this.metastoreService.findOne(
        publication.metaStoreId.toString(),
      );

      return {
        ...publicationObj,
        department: undefined,
        metadata,
        metaStoreId: undefined,
      } as unknown as PublicationDto;
    }

    return publicationObj.toJSON();
  }

  async delete(id: string): Promise<Publication> {
    const publication = await this.publicationModel
      .findByIdAndDelete(id)
      .exec();
    if (publication) {
      await this.minioService.client.removeObject(
        publication.bucketName,
        publication.fileName,
      );
      if (publication.metaStoreId) {
        await this.metastoreService.remove(publication.metaStoreId.toString());
      }
    }
    return publication;
  }

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

  async listBuckets() {
    const buckets = await this.minioService.client.listBuckets();
    return buckets;
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

  async listFiles(bucketName: string, path?: string): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      const objectsList = [];
      try {
        const bucketExists =
          await this.minioService.client.bucketExists(bucketName);
        if (!bucketExists) {
          return reject(new Error(`Bucket ${bucketName} does not exist.`));
        }

        if (!path) {
          path = '';
        }
        const stream = this.minioService.client.listObjectsV2(
          bucketName,
          path,
          true,
        );

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
      const stream = this.minioService.client.listObjects(
        bucket.name,
        '',
        true,
      );

      for await (const item of stream) {
        const key = item.name;
        const parts = key.split('/');
        if (parts.length > 1) {
          for (let i = 1; i < parts.length; i++) {
            locations.add(parts.slice(0, i).join('/'));
          }
        }
      }
    }

    return Array.from(locations).sort();
  }

  async uploadFileFromBuffer(
    bucketName: string,
    fileName: string,
    fileBuffer: Buffer,
    metadata: any,
  ) {
    try {
      const stream = new Readable();
      stream.push(fileBuffer);
      stream.push(null);

      await this.minioService.client.putObject(
        bucketName,
        fileName,
        stream,
        fileBuffer.length,
      );
      console.log('File uploaded successfully.');

      const metastoreId = await this.metastoreService.create(metadata);

      await this.publicationModel.findOneAndUpdate(
        { bucketName, fileName },
        {
          bucketName,
          fileName,
          permanentLink: this.generatePublicUrl(bucketName, fileName),
          uploadDate: new Date(),
          metastoreId,
        },
        { upsert: true, new: true },
      );
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  }

  async updateFileMetadata(
    bucketName: string,
    fileName: string,
    newMetadata: any,
  ) {
    try {
      const publication = await this.publicationModel.findOne({
        bucketName,
        fileName,
      });
      if (!publication) {
        throw new Error('Publication not found');
      }

      if (publication.metaStoreId) {
        await this.metastoreService.update(
          publication.metaStoreId.toString(),
          newMetadata,
        );
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

  async uploadFileToNestedDirectory(
    bucketName: string,
    directory: string,
    fileName: string,
    fileBuffer: Buffer,
    metadata: any,
  ) {
    const filePath = `${directory}/${fileName}`;
    await this.uploadFileFromBuffer(bucketName, filePath, fileBuffer, metadata);
  }

  async deletePublication(
    id: string,
    forceDelete?: boolean,
  ): Promise<{ message: string }> {
    console.log('forceDelete:', forceDelete);
    const publication = await this.findOne(id);
    if (!publication) {
      throw new NotFoundException(`Publication with id ${id} not found`);
    }

    const { fileName, bucketName, metadata } = publication;

    try {
      let fileExists = true;
      try {
        await this.minioService.client.statObject(bucketName, fileName);
      } catch (error) {
        if (error.code === 'NotFound') {
          fileExists = false;
          if (!forceDelete) {
            throw new BadRequestException(
              `File ${fileName} not found in bucket ${bucketName}. Use forceDelete to remove database entries.`,
            );
          }
        } else {
          throw error;
        }
      }

      if (fileExists) {
        const minioFileInfo = await this.minioService.client.statObject(
          bucketName,
          fileName,
        );
        console.log;
        if (
          minioFileInfo.size !== publication.metadata.size ||
          minioFileInfo.lastModified.toISOString() !==
            publication.metadata.modified_date.toISOString()
        ) {
          if (!forceDelete) {
            throw new BadRequestException(
              'File details in MinIO do not match publication record. Use forceDelete to remove anyway.',
            );
          }
        }
      }

      if (fileExists) {
        await this.minioService.client.removeObject(bucketName, fileName);
      }

      if (metadata) {
        await this.metastoreService.remove(metadata._id.toString());
      }

      const deletedPublication =
        await this.publicationModel.findByIdAndDelete(id);
      if (!deletedPublication) {
        throw new Error(
          'Publication was not found in the database during deletion',
        );
      }

      console.log(`Publication ${id} and associated data deleted successfully`);
      return {
        message: fileExists
          ? 'Publication and associated data deleted successfully'
          : 'Publication database entries deleted successfully. File was already removed from MinIO.',
      };
    } catch (error) {
      console.error(`Error deleting publication ${id}:`, error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to delete publication ${id}. Partial deletion may have occurred.`,
      );
    }
  }

  private async uploadFileToMinio(
    bucketName: string,
    fileName: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<void> {
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);
    await this.minioService.client.putObject(
      bucketName,
      fileName,
      stream,
      fileBuffer.length,
    );
  }
}
