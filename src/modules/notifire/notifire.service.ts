// notifire.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotifireDto } from './dto/create-notifire.dto';
import { UpdateNotifireDto } from './dto/update-notifire.dto';
import { Notifire } from './schemas/notifire.schema';

@Injectable()
export class NotifireService {
  constructor(
    @InjectModel(Notifire.name) private readonly notifireModel: Model<Notifire>,
  ) {}

  async create(createNotifireDto: CreateNotifireDto): Promise<Notifire> {
    const notifire = new this.notifireModel(createNotifireDto);
    return notifire.save();
  }

  async findAll(): Promise<Notifire[]> {
    return this.notifireModel.find().exec();
  }

  async findOne(id: string): Promise<Notifire> {
    const notifire = await this.notifireModel.findById(id).exec();
    if (!notifire) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }
    return notifire;
  }

  async update(
    id: string,
    updateNotifireDto: UpdateNotifireDto,
  ): Promise<Notifire> {
    const notifire = await this.notifireModel
      .findByIdAndUpdate(id, updateNotifireDto, { new: true })
      .exec();
    if (!notifire) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }
    return notifire;
  }

  async remove(id: string): Promise<Notifire> {
    const notifire = await this.notifireModel.findByIdAndDelete(id).exec();
    if (!notifire) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }
    return notifire;
  }
}
