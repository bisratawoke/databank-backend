// src/departments/departments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department } from './schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { SearchDepartmentDto } from './dto/search-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name) private departmentModel: Model<Department>,
  ) {}

  async getDepartmentHead(department: string) {
    return { email: 'awoke199@gmail.com' };
  }
  /**
   * Create a new Department
   * @param createDepartmentDto Data for creating a department
   * @returns The created Department
   */
  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const createdDepartment = new this.departmentModel({
      ...createDepartmentDto,
      category: createDepartmentDto.category.map(
        (id) => new Types.ObjectId(id),
      ),
    });
    return createdDepartment.save();
  }

  /**
   * Retrieve all Departments
   * @param searchDto Optional search parameters
   * @returns Array of Departments
   */
  async findAll(searchDto?: SearchDepartmentDto): Promise<Department[]> {
    const filter: any = {};
    if (searchDto?.name) {
      filter['name'] = { $regex: searchDto.name, $options: 'i' }; // Case-insensitive search
    }
    return this.departmentModel
      .find(filter)
      .populate({
        path: 'category',
        populate: {
          path: 'subcategory',
          populate: {
            path: 'report',
          },
        },
      })
      .exec();
  }

  /**
   * Retrieve a single Department by ID
   * @param id Department ID
   * @returns The found Department
   * @throws NotFoundException if Department not found
   */
  async findOne(id: string): Promise<Department> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }

    const department = await this.departmentModel
      .findById(id)
      .populate('category')
      .exec();
    if (!department) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
    return department;
  }

  /**
   * Update a Department by ID
   * @param id Department ID
   * @param updateDepartmentDto Data for updating the department
   * @returns The updated Department
   * @throws NotFoundException if Department not found
   */
  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    // Create a new object to avoid mutating the DTO
    const updateData: Partial<UpdateDepartmentDto> | any = {
      ...updateDepartmentDto,
    };

    if (updateDepartmentDto.category) {
      updateData.category = updateDepartmentDto.category.map(
        (id) => new Types.ObjectId(id),
      );
    }

    const updatedDepartment = await this.departmentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('category')
      .exec();

    if (!updatedDepartment) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
    return updatedDepartment;
  }

  /**
   * Delete a Department by ID
   * @param id Department ID
   * @returns Void
   * @throws NotFoundException if Department not found
   */
  async remove(id: string): Promise<void> {
    const result = await this.departmentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
  }
}
