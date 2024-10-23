// src/subcategories/subcategories.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { SearchSubCategoryDto } from './dto/search-subcategory.dto';
import { SubCategory } from './schemas/sub-category.schema';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Subcategories') // Tag for grouping in Swagger UI
@Controller('subcategories')
export class SubCategoryController {
  constructor(private readonly subCategoriesService: SubCategoryService) { }

  /**
   * Create a new SubCategory
   * POST /subcategories
   */
  @Post()
  @ApiOperation({ summary: 'Create a new subcategory' })
  @ApiResponse({
    status: 201,
    description: 'The subcategory has been created successfully.',
    type: SubCategory,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(
    @Body() createSubCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategory> {
    return this.subCategoriesService.create(createSubCategoryDto);
  }

  /**
   * Retrieve all SubCategories with optional search
   * GET /subcategories
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all subcategories with optional search' })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Search subcategories by name',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of subcategories returned successfully.',
    type: [SubCategory],
  })
  async findAll(
    @Query() searchSubCategoryDto: SearchSubCategoryDto,
  ): Promise<SubCategory[]> {
    return this.subCategoriesService.findAll(searchSubCategoryDto);
  }

  /**
   * Retrieve a single SubCategory by ID
   * GET /subcategories/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a subcategory by ID' })
  @ApiParam({ name: 'id', description: 'SubCategory ID' })
  @ApiResponse({
    status: 200,
    description: 'The subcategory was found and returned successfully.',
    type: SubCategory,
  })
  @ApiResponse({ status: 404, description: 'SubCategory not found.' })
  async findOne(@Param('id') id: string): Promise<SubCategory> {
    return this.subCategoriesService.findOne(id);
  }

  /**
   * Update a SubCategory by ID
   * PUT /subcategories/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a subcategory by ID' })
  @ApiParam({ name: 'id', description: 'SubCategory ID' })
  @ApiResponse({
    status: 200,
    description: 'The subcategory has been updated successfully.',
    type: SubCategory,
  })
  @ApiResponse({ status: 404, description: 'SubCategory not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategory> {
    return this.subCategoriesService.update(id, updateSubCategoryDto);
  }

  /**
   * Delete a SubCategory by ID
   * DELETE /subcategories/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subcategory by ID' })
  @ApiParam({ name: 'id', description: 'SubCategory ID' })
  @ApiResponse({
    status: 200,
    description: 'The subcategory has been deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'SubCategory not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.subCategoriesService.remove(id);
  }
}
