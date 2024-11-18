// src/category/category.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './schemas/category.schema';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'The category has been successfully created.',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed.',
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all categories' })
  @ApiResponse({
    status: 200,
    description: 'List of all categories.',
    type: [Category],
  })
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single category by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The unique identifier of the category',
    example: '60d21b4667d0d8992e610c85',
  })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully retrieved.',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing category' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The unique identifier of the category to update',
    example: '60d21b4667d0d8992e610c85',
  })
  @ApiBody({
    type: UpdateCategoryDto,
    description: 'Data to update the category',
  })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully updated.',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The unique identifier of the category to delete',
    example: '60d21b4667d0d8992e610c85',
  })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully deleted.',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  async remove(@Param('id') id: string): Promise<Category> {
    return this.categoryService.remove(id);
  }
}
