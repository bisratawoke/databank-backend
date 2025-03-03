import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Metastore } from './schemas/metastore.schema'; // Adjust the import according to your project structure
import { CreateMetastoreDto } from './dto/create-metastore.dto'; // Create DTO files for validation
import { UpdateMetastoreDto } from './dto/update-metastore.dto';
import { MetastoreDto } from './dto/metastore.dto';
@Injectable()
export class MetastoreService {
  constructor(
    @InjectModel(Metastore.name) private metastoreModel: Model<Metastore>,
  ) { }

  async create(createMetastoreDto: CreateMetastoreDto): Promise<MetastoreDto> {
    const createdMetastore = new this.metastoreModel(createMetastoreDto);
    return (await createdMetastore.save()).toJSON() as Metastore;
  }

  async findAll(): Promise<Metastore[]> {
    return this.metastoreModel.find().exec();
  }

  async findOne(id: string): Promise<MetastoreDto> {
    const metastore = await this.metastoreModel.findById(id).exec();
    if (!metastore) {
      throw new NotFoundException(`Metastore with id ${id} not found`);
    }
    return metastore.toJSON() as Metastore;
  }

  async update(
    id: string,
    updateMetastoreDto: UpdateMetastoreDto,
  ): Promise<Metastore> {
    const updatedMetastore = await this.metastoreModel
      .findByIdAndUpdate(id, updateMetastoreDto, { new: true })
      .exec();
    if (!updatedMetastore) {
      throw new NotFoundException(`Metastore with id ${id} not found`);
    }
    return updatedMetastore;
  }

  async remove(id: string): Promise<void> {
    const result = await this.metastoreModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Metastore with id ${id} not found`);
    }
  }
}
