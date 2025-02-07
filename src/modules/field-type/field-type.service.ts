import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FieldType } from './schemas/field-type.schema';
import { CreateFieldTypeDto } from './dto/create-field-type.dto';
import { UpdateFieldTypeDto } from './dto/update-field-type.dto';
import { Field } from '../field/schemas/field.schema';

@Injectable()
export class FieldTypeService {
  constructor(
    @InjectModel(FieldType.name) private fieldTypeModel: Model<FieldType>,
    @InjectModel(Field.name) private fieldModel: Model<Field>,
  ) {}

  // Create a new FieldType
  async create(createFieldTypeDto: CreateFieldTypeDto): Promise<FieldType> {
    try {
      const createdFieldType = new this.fieldTypeModel(createFieldTypeDto);
      return await createdFieldType.save();
    } catch (err) {
      if (err.code == 11000) {
        throw new BadRequestException('Fieldtype already exists');
      } else
        throw new InternalServerErrorException('Failed to create field type');
    }
  }

  // Retrieve all FieldTypes
  async findAll(): Promise<FieldType[]> {
    return this.fieldTypeModel.find().exec();
  }

  async findRelatedFields(id: string): Promise<Field[]> {
    const result = await this.fieldModel.find({ type: id });
    return result;
  }
  // Retrieve a FieldType by ID
  async findById(id: string): Promise<FieldType> {
    const fieldType = await this.fieldTypeModel.findById(id).exec();
    if (!fieldType) {
      throw new NotFoundException(`FieldType with ID ${id} not found`);
    }
    return fieldType;
  }

  // Update a FieldType by ID
  async update(
    id: string,
    updateFieldTypeDto: UpdateFieldTypeDto,
  ): Promise<FieldType> {
    const updatedFieldType = await this.fieldTypeModel
      .findByIdAndUpdate(id, updateFieldTypeDto, {
        new: true,
        useFindAndModify: false,
      })
      .exec();
    if (!updatedFieldType) {
      throw new NotFoundException(`FieldType with ID ${id} not found`);
    }
    return updatedFieldType;
  }

  // Delete a FieldType by ID
  async delete(id: string): Promise<FieldType> {
    const deletedFieldType = await this.fieldTypeModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedFieldType) {
      throw new NotFoundException(`FieldType with ID ${id} not found`);
    }
    return deletedFieldType;
  }
}
