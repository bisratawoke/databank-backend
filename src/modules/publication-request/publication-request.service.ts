import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PublicationRequest } from './schemas/publication-request.schema';
import { UpdatePublicationRequestDto } from './dto/update-publication-request.dto';
import { CreatePublicationRequestDto } from './dto/create-publication-request.dto';

@Injectable()
export class PublicationRequestService {
  constructor(
    @InjectModel(PublicationRequest.name)
    private readonly publicationRequestModel: Model<PublicationRequest>,
  ) {}

  async createPublicationRequest(
    createPublicationRequestDto: CreatePublicationRequestDto,
    fileUrl?: string[],
  ): Promise<PublicationRequest> {
    console.log(
      '================= in create publication request =================',
    );
    console.log(fileUrl);
    const newPublicationRequest = new this.publicationRequestModel({
      ...createPublicationRequestDto,
      attachments: fileUrl ? fileUrl : [],
    });
    return newPublicationRequest.save();
  }
  async create(
    createDto: CreatePublicationRequestDto,
    userId: string,
  ): Promise<PublicationRequest> {
    const createdRequest = new this.publicationRequestModel({
      ...createDto,
      author: userId,
    });
    return createdRequest.save();
  }

  async findAll(userId: string): Promise<PublicationRequest[]> {
    // .find({ author: userId })
    return this.publicationRequestModel
      .find()
      .populate('author category')
      .exec();
  }

  async findOne(id: string, userId: string): Promise<PublicationRequest> {
    const publication = await this.publicationRequestModel
      .findOne({ _id: id, author: userId })
      .populate('author category')
      .exec();

    if (!publication) {
      throw new NotFoundException(
        `PublicationRequest with ID ${id} not found or unauthorized.`,
      );
    }

    return publication;
  }

  async update(
    id: string,
    updateDto: UpdatePublicationRequestDto,
    userId: string,
  ): Promise<PublicationRequest> {
    const updated = await this.publicationRequestModel
      .findOneAndUpdate({ _id: id, author: userId }, updateDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `PublicationRequest with ID ${id} not found or unauthorized.`,
      );
    }

    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await this.publicationRequestModel
      .findOneAndDelete({ _id: id, author: userId })
      .exec();

    if (!deleted) {
      throw new NotFoundException(
        `PublicationRequest with ID ${id} not found or unauthorized.`,
      );
    }
  }
}
