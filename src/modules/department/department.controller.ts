// src/departments/departments.controller.ts
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
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { SearchDepartmentDto } from './dto/search-department.dto';
import { Department } from './schemas/department.schema';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Departments') // Tag for grouping in Swagger UI
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentsService: DepartmentService) { }

  /**
   * Create a new Department
   * POST /departments
   */
  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({
    status: 201,
    description: 'The department has been created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<Department> {
    return this.departmentsService.create(createDepartmentDto);
  }

  /**
   * Retrieve all Departments with optional search
   * GET /departments
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all departments with optional search' })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Search by department name',
  })
  @ApiResponse({
    status: 200,
    description: 'List of departments returned successfully.',
  })
  async findAll(
    @Query() searchDepartmentDto: SearchDepartmentDto,
  ): Promise<Department[]> {
    return this.departmentsService.findAll(searchDepartmentDto);
  }

  /**
   * Retrieve a single Department by ID
   * GET /departments/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({
    status: 200,
    description: 'The department was found and returned successfully.',
  })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  async findOne(@Param('id') id: string): Promise<Department> {
    return this.departmentsService.findOne(id);
  }

  /**
   * Update a Department by ID
   * PUT /departments/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({
    status: 200,
    description: 'The department has been updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  /**
   * Delete a Department by ID
   * DELETE /departments/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({
    status: 200,
    description: 'The department has been deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.departmentsService.remove(id);
  }
}
