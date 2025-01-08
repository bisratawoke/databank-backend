import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PublicationRequest,
  Status,
} from './schemas/publication-request.schema';
import { UpdatePublicationRequestDto } from './dto/update-publication-request.dto';
import { CreatePublicationRequestDto } from './dto/create-publication-request.dto';
import PublicationPayment, {
  PaymentStatus,
} from './schemas/publication-payment.schema';
import CreatePublicationRequestWithAuthorId from './dto/create-publication-request-with-user-id';

@Injectable()
export class PublicationRequestService {
  constructor(
    @InjectModel(PublicationRequest.name)
    private readonly publicationRequestModel: Model<PublicationRequest>,
    @InjectModel(PublicationPayment.name)
    private readonly publicationPaymentModel: Model<PublicationPayment>,
  ) {}

  async getCurrentPortalUserPublicationRequests(portalUserId: string) {
    return this.publicationRequestModel.find({
      author: portalUserId,
    });
  }
  async confirmPayment(publicationRequestId: string) {
    const publicationPayment = await this.publicationRequestModel
      .findById(publicationRequestId)
      .populate('paymentData')
      .exec();

    return await this.publicationPaymentModel.findByIdAndUpdate(
      {
        _id: publicationPayment.paymentData._id,
      },
      {
        paymentStatus: PaymentStatus.CONFIRMED,
        status: Status.PAYMENT_VERIFIED,
      },
    );
  }

  async paymentSetup(publicationRequestId: string, price: number) {
    const newPublicationPayment = await this.publicationPaymentModel.create({
      price: price,
    });

    return await this.publicationRequestModel.findOneAndUpdate(
      { _id: publicationRequestId },
      { paymentData: newPublicationPayment._id, paymentRequired: true },
      { new: true },
    );
  }

  async finalApproval(publicationRequestId) {
    const currentPublicationRequest = await this.publicationRequestModel
      .findOne({ _id: publicationRequestId })
      .exec();
    return await this.publicationRequestModel
      .findByIdAndUpdate(
        { _id: publicationRequestId },
        {
          status: Status.FINAL_APPOVAL,
        },
        { new: true },
      )
      .exec();
  }

  async setFilePath(publicationRequestId, filePath) {
    const currentPublicationRequest = await this.publicationRequestModel
      .findOne({ _id: publicationRequestId })
      .exec();
    return await this.publicationRequestModel
      .findByIdAndUpdate(
        { _id: publicationRequestId },
        {
          fileName: filePath,
        },
        { new: true },
      )
      .exec();
  }

  async secondaryApproval(publicationRequestId) {
    const currentPublicationRequest = await this.publicationRequestModel
      .findOne({ _id: publicationRequestId })
      .exec();
    return await this.publicationRequestModel
      .findByIdAndUpdate(
        { _id: publicationRequestId },
        {
          status: currentPublicationRequest.paymentRequired
            ? Status.PAYMENT_PENDING
            : Status.DEPUTY_APPROVED,
        },
        { new: true },
      )
      .exec();
  }

  async approve(publicationRequestId) {
    return await this.publicationRequestModel
      .findByIdAndUpdate(
        { _id: publicationRequestId },
        { status: Status.INITIAL_APPROVAL },
        { new: true },
      )
      .exec();
  }

  async reject(publicationRequestId: string) {
    return await this.publicationRequestModel.findByIdAndUpdate(
      { _id: publicationRequestId },
      { status: Status.Rejected },
      { new: true },
    );
  }
  async assignPublicationToDepartment(deparmentId, publicationRequestId) {
    return await this.publicationRequestModel
      .findByIdAndUpdate(
        { _id: publicationRequestId },
        {
          department: new Types.ObjectId(deparmentId),
          status: Status.PENDING_APPROVAL,
        },
        { new: true },
      )
      .exec();
  }
  async createPublicationRequest(
    createPublicationRequestDto: CreatePublicationRequestWithAuthorId,
    fileUrl?: string[],
  ): Promise<PublicationRequest> {
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
      // author: userId,
    });
    return createdRequest.save();
  }

  async findAll(userId: string): Promise<PublicationRequest[]> {
    return this.publicationRequestModel
      .find()
      .populate('author category paymentData')
      .exec();
  }

  async findOne(id: string, userId: string): Promise<PublicationRequest> {
    const publication = await this.publicationRequestModel
      .findOne({
        _id: id,
        //  author: userId
      })
      .populate('author category paymentData')
      .populate('department')
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
      .findOneAndUpdate(
        {
          _id: id,
          // author: userId
        },
        updateDto,
        { new: true },
      )
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
      .findOneAndDelete({
        _id: id,
        // author: userId
      })
      .exec();

    if (!deleted) {
      throw new NotFoundException(
        `PublicationRequest with ID ${id} not found or unauthorized.`,
      );
    }
  }
}
