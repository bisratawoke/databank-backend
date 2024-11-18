import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '../auth/constants/user-role';

@ApiBearerAuth()
@ApiTags('Subcategories')
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subcategories')
export class SubCategoryController {
  constructor(private readonly subCategoriesService: SubCategoryService) {}

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

  @Roles(UserRole.DEPARTMENT_HEAD)
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
