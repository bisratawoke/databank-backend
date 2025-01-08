import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import PublicationPayment from './schemas/payment';
import {
  CreatePublicationPaymentDto,
  UpdatePublicationPaymentDto,
} from './dto/payment.dto';
import {
  PublicationRequest,
  Status,
} from '../publication-request/schemas/publication-request.schema';

@Injectable()
export class PublicationPaymentService {
  constructor(
    @InjectModel(PublicationPayment.name)
    private readonly model: Model<PublicationPayment>,
    @InjectModel(PublicationRequest.name)
    private readonly publicationRequestModel: Model<PublicationRequest>,
  ) {}

  async create(dto: CreatePublicationPaymentDto): Promise<PublicationPayment> {
    const createdPayment = new this.model(dto);
    return createdPayment.save();
  }

  async findAll(): Promise<PublicationPayment[]> {
    return this.model.find().populate('author').exec();
  }

  async findOne(id: string): Promise<PublicationPayment> {
    const payment = await this.model.findById(id).populate('author').exec();
    if (!payment) {
      throw new NotFoundException(`PublicationPayment with ID ${id} not found`);
    }
    return payment;
  }

  async update(
    id: string,
    dto: UpdatePublicationPaymentDto,
  ): Promise<PublicationPayment> {
    const updatedPayment = await this.model.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });

    if (dto.publciationRequest) {
      await this.publicationRequestModel.findByIdAndUpdate(
        dto.publciationRequest,
        {
          status: Status.PAYMENT_VERIFIED,
        },
        {
          new: true,
          runValidators: true,
        },
      );
    }
    if (!updatedPayment) {
      throw new NotFoundException(`PublicationPayment with ID ${id} not found`);
    }
    return updatedPayment;
  }

  async remove(id: string): Promise<void> {
    const deletedPayment = await this.model.findByIdAndDelete(id);
    if (!deletedPayment) {
      throw new NotFoundException(`PublicationPayment with ID ${id} not found`);
    }
  }
}
