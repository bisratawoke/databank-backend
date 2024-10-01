// src/categories/categories.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  /**
   * Create a new Category
   * @param createCategoryDto Data for creating a category
   * @returns The created Category
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  /**
   * Retrieve all Categories
   * @returns Array of Categories
   */
  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  /**
   * Retrieve a single Category by ID
   * @param id Category ID
   * @returns The found Category
   * @throws NotFoundException if Category not found
   */
  async findOne(id: string): Promise<Category> {
    if (!this.isValidObjectId(id)) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  /**
   * Update a Category by ID
   * @param id Category ID
   * @param updateCategoryDto Data for updating the category
   * @returns The updated Category
   * @throws NotFoundException if Category not found
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return updatedCategory;
  }

  /**
   * Delete a Category by ID
   * @param id Category ID
   * @returns Void
   * @throws NotFoundException if Category not found
   */
  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
  }

  /**
   * Utility method to check if a string is a valid MongoDB ObjectId
   * @param id The id string to validate
   * @returns Boolean indicating validity
   */
  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}
