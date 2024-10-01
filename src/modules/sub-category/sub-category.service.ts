// src/subcategories/subcategories.service.ts

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

  /**
   * Create a new SubCategory
   * @param createSubCategoryDto Data for creating a subcategory
   * @returns The created SubCategory
   */
  async create(
    createSubCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategory> {
    const createdSubCategory = new this.subCategoryModel({
      ...createSubCategoryDto,
      category: createSubCategoryDto.category.map(
        (id) => new Types.ObjectId(id),
      ),
    });
    return createdSubCategory.save();
  }

  /**
   * Retrieve all SubCategories with optional search
   * @param searchDto Optional search parameters
   * @returns Array of SubCategories
   */
  async findAll(searchDto?: SearchSubCategoryDto): Promise<SubCategory[]> {
    const filter: any = {};
    if (searchDto?.name) {
      filter['name'] = { $regex: searchDto.name, $options: 'i' }; // Case-insensitive search
    }
    return this.subCategoryModel.find(filter).populate('category').exec();
  }

  /**
   * Retrieve a single SubCategory by ID
   * @param id SubCategory ID
   * @returns The found SubCategory
   * @throws NotFoundException if SubCategory not found
   */
  async findOne(id: string): Promise<SubCategory> {
    if (!this.isValidObjectId(id)) {
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    }

    const subCategory = await this.subCategoryModel
      .findById(id)
      .populate('category')
      .exec();
    if (!subCategory) {
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    }
    return subCategory;
  }

  /**
   * Update a SubCategory by ID
   * @param id SubCategory ID
   * @param updateSubCategoryDto Data for updating the subcategory
   * @returns The updated SubCategory
   * @throws NotFoundException if SubCategory not found
   */
  async update(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategory> {
    // Create a new object to avoid mutating the DTO
    const updateData: Partial<UpdateSubCategoryDto> | any = {
      ...updateSubCategoryDto,
    };

    if (updateSubCategoryDto.category) {
      updateData.category = updateSubCategoryDto.category.map(
        (id) => new Types.ObjectId(id),
      );
    }

    const updatedSubCategory = await this.subCategoryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('category')
      .exec();

    if (!updatedSubCategory) {
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    }
    return updatedSubCategory;
  }

  /**
   * Delete a SubCategory by ID
   * @param id SubCategory ID
   * @returns Void
   * @throws NotFoundException if SubCategory not found
   */
  async remove(id: string): Promise<void> {
    const result = await this.subCategoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    }
  }

  /**
   * Utility method to check if a string is a valid MongoDB ObjectId
   * @param id The id string to validate
   * @returns Boolean indicating validity
   */
  private isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }
}
