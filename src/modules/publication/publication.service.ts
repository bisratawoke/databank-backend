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
import {
  Publication,
  PublicationDocument,
  Status,
} from './schemas/publication.schema';
import { MetastoreService } from '../metastore/metastore.service';
import { PublicationDto } from './dto/publicatoin.dto';
import { CreateMetastoreDto } from '../metastore/dto/create-metastore.dto';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { populate } from 'dotenv';
import { UserService } from '../auth/services/user.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
@Injectable()
export class PublicationService {
  constructor(
    @InjectModel(Publication.name)
    private publicationModel: Model<PublicationDocument>,
    public readonly minioService: MinioService,
    private readonly metastoreService: MetastoreService,
    private readonly userService: UserService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async reject(publicationId: string) {
    try {
      const updatedReport = await this.publicationModel.findByIdAndUpdate(
        new Types.ObjectId(publicationId),
        { status: Status.Rejected },
        { new: true },
      );

      if (!updatedReport) {
        throw new NotFoundException(
          `Report with ID ${publicationId} not found`,
        );
      }

      return updatedReport;
    } catch (err) {
      throw err;
    } finally {
    }
  }

  async findPublicationsByDepartmentAndCategory({ departmentId, categoryId }) {
    return this.publicationModel
      .find({
        department: departmentId,
        category: categoryId,
      })
      .exec();
  }
  public async getDissimenationHead() {
    const user = await this.userService.findDissimenationHead();
    return user;
  }

  private async publishToInappQueue(message: { body: string; to: string }) {
    await this.amqpConnection.publish(
      'logs_exchange',
      'inapp_notification_queue',
      message,
    );
  }

  async getReportAuthor(publicationId: string): Promise<Types.ObjectId | null> {
    const report = await this.publicationModel
      .findById(publicationId)
      .select('author')
      .populate('author')
      .exec();

    return report ? report.author : null;
  }

  public async initialRequestResponse(
    status: string,
    publicationId: string,
    from: string,
  ) {
    try {
      const author = await this.getReportAuthor(publicationId);
      await this.publishToInappQueue({
        to: author._id.toString(),
        body: `publication ${publicationId} status has been updated to ${status}`,
      });
      return author;
    } catch (err) {
      throw err;
    } finally {
    }
  }

  async publish(publicationId: string) {
    try {
      const updatedReport = await this.publicationModel.findByIdAndUpdate(
        new Types.ObjectId(publicationId),
        { status: Status.Published },
        { new: true },
      );

      if (!updatedReport) {
        throw new NotFoundException(
          `Report with ID ${publicationId} not found`,
        );
      }

      return updatedReport;
    } catch (err) {
      throw err;
    } finally {
    }
  }

  public async approve(publicationId: string) {
    const updatedPublication = await this.publicationModel.findByIdAndUpdate(
      new Types.ObjectId(publicationId),
      { status: Status.Approved },
      { new: true },
    );

    if (!updatedPublication) {
      throw new NotFoundException(
        `Publication with ID ${publicationId} not found`,
      );
    }

    return updatedPublication;
  }
  public async requestInitalApproval({
    publicationId,
    from,
  }: {
    publicationId: string;
    from: string;
  }) {
    try {
      const dissmenationHeads = await this.getDissimenationHead();
      dissmenationHeads.forEach(async (dissmenationHead) => {
        await this.publishToInappQueue({
          body: `publication ${publicationId} has been uploaded by dpertment head and requires your final say!`,
          to: dissmenationHead._id.toString(),
        });
      });
      return {};
    } catch (error) {}
  }

  async uploadPublicationCoverImage(
    bucketName = 'static',
    coverImage: Express.Multer.File,
  ) {
    const filePath = `${new Date().getTime()}-${coverImage.originalname}`;
    await this.uploadFileToMinio(
      bucketName,
      filePath,
      coverImage.buffer,
      coverImage.mimetype,
    );
    const link = await this.generatePublicUrlProd(bucketName, filePath);

    return link;
  }
  async create(
    coverImage: Express.Multer.File = null,
    file: Express.Multer.File,
    createPublicationDto: CreatePublicationDto,
  ): Promise<{ publication: Publication; metadata: any }> {
    const buffer = file.buffer;

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

    await this.uploadFileToMinio(bucketName, filePath, buffer, file.mimetype);

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

    let coverImageLink = null;
    if (coverImage) {
      coverImageLink = await this.uploadPublicationCoverImage(
        process.env.STATIC_FILES_MINIO_BUCKET_NAME,
        coverImage,
      );
    }

    const newPublication = new this.publicationModel({
      fileName: filePath,
      bucketName: bucketName,
      metaStoreId: metastoreDoc._id,
      permanentLink: permanentLink,
      uploadDate: new Date(),
      department: createPublicationDto.department,
      category: createPublicationDto.category,
      publicationType: createPublicationDto.publicationType,
      author: createPublicationDto.author,
      coverImageLink: coverImageLink,
      price: createPublicationDto.price,
      paymentRequired: createPublicationDto.paymentRequired,
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
    const publication = await this.publicationModel
      .findById(id)
      .populate('category')
      .exec();

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
      } else {
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
      return url;
    } catch (err) {
      throw err;
    }
  }

  generatePublicUrl(bucketName: string, filePath: string): string {
    const minioServerUrl = `${process.env.MINIO_PROD_ENDPOINT}:${process.env.MINIO_PORT}`;
    return `${minioServerUrl}/${bucketName}/${filePath}`;
  }

  generatePublicUrlProd(bucketName: string, filePath: string): string {
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
    try {
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
    } catch (err) {}
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
    } catch (err) {
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
