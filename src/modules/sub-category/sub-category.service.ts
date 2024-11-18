import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SubCategory } from './schemas/sub-category.schema';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { SearchSubCategoryDto } from './dto/search-subcategory.dto';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
  ) {}

  async create(
    createSubCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategory> {
    const createdSubCategory = new this.subCategoryModel({
      ...createSubCategoryDto,
      category: createSubCategoryDto.report.map((id) => new Types.ObjectId(id)),
    });
    return createdSubCategory.save();
  }

  async findAll(searchDto?: SearchSubCategoryDto): Promise<SubCategory[]> {
    const filter: any = {};
    if (searchDto?.name) {
      filter['name'] = { $regex: searchDto.name, $options: 'i' }; // Case-insensitive search
    }
    return this.subCategoryModel.find(filter).populate('report').exec();
  }

  async findOne(id: string): Promise<SubCategory> {
    if (!this.isValidObjectId(id)) {
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    }

    const subCategory = await this.subCategoryModel
      .findById(id)
      .populate('report')
      .exec();
    if (!subCategory) {
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    }
    return subCategory;
  }

  async update(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategory> {
    const updateData: Partial<UpdateSubCategoryDto> | any = {
      ...updateSubCategoryDto,
    };

    if (updateSubCategoryDto.report) {
      updateData.category = updateSubCategoryDto.report.map(
        (id) => new Types.ObjectId(id),
      );
    }

    const updatedSubCategory = await this.subCategoryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('report')
      .exec();

    if (!updatedSubCategory) {
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    }
    return updatedSubCategory;
  }

  async remove(id: string): Promise<void> {
    const result = await this.subCategoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    }
  }

  private isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }
}
