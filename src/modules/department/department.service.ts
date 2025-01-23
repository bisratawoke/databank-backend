// src/departments/departments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department } from './schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { SearchDepartmentDto } from './dto/search-department.dto';
import { User } from '../auth/schemas/user.schema';
import { UserRole } from '../auth/constants/user-role';
import { PaginationQueryDto } from 'src/common/dto/paginated-query.dto';
import { Report } from '../report/schemas/report.schema';
import { report } from 'process';
import { populate } from 'dotenv';
@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name) private departmentModel: Model<Department>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Report.name) private readonly reportModel: Model<Report>
  ) { }

  public async isDepartmentHead(userId: string) {
    const departmentHead = await this.getDepartmentHead(userId);
    return userId == departmentHead._id;
  }

  public async getDepartmentHeadByDepartmentId(deptId: string) {
    const department = await this.departmentModel
      .findById(deptId)
      .populate('head')
      .exec();

    return department.head;
  }

  public async getDepartmentHead(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('department')
      .exec();

    if (!user || !user.department) {
      throw new Error('User or department not found');
    }

    const departmentHead = await this.userModel.findOne({
      department: user.department._id.toString(),
      roles: { $in: [UserRole.DEPARTMENT_HEAD] },
    });

    return departmentHead
      ? { email: departmentHead.email, _id: departmentHead._id.toString() }
      : null;
  }
  /**
   * Create a new Department
   * @param createDepartmentDto Data for creating a department
   * @returns The created Department
   */
  // async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
  //   const createdDepartment = new this.departmentModel({
  //     ...createDepartmentDto,
  //     category: createDepartmentDto.category.map(
  //       (id) => new Types.ObjectId(id),
  //     ),
  //   });
  //   return createdDepartment.save();
  // }

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const departmentData: Partial<Department> | any = {
      ...createDepartmentDto,
      category: createDepartmentDto.category?.map(
        (id) => new Types.ObjectId(id),
      ),
    };

    if (createDepartmentDto.head) {
      departmentData.head = new Types.ObjectId(createDepartmentDto.head);
    }

    const createdDepartment = new this.departmentModel(departmentData);
    return createdDepartment.save();
  }

  async setDepartmentHead(
    departmentId: string,
    headId: string,
  ): Promise<Department> {
    const department = await this.departmentModel.findById(departmentId);

    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`,
      );
    }

    department.head = new Types.ObjectId(headId);
    await department.save();
    return department;
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
  async findAllPaginated(
    query?: PaginationQueryDto,
    searchDto?: SearchDepartmentDto,
  ) {
    const filter: any = {};
    if (searchDto?.name) {
      filter['name'] = { $regex: searchDto.name, $options: 'i' }; // Case-insensitive search
    }

    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;


    // Fetch total count of departments
    const totalDepartments = await this.departmentModel.countDocuments(filter);

    // Fetch departments and populate categories and subcategories
    const departments = await this.departmentModel
      .find(filter)
      .populate({
        path: 'category',
        populate: {
          path: 'subcategory',
          populate: {
            path: 'report'
          }
        },
      })
      .limit(limit)
      .skip(skip)
      .exec();

    // Handle nested population and manual pagination for `report`
    // for (const department of departments) {
    //   // Ensure categories are populated
    //   const categories = department.category as any[]; // Cast to `any` for flexibility
    //   for (const category of categories) {
    //     if (category.subcategory) {
    //       for (const subcategory of category.subcategory) {


    //         // Manually fetch reports with pagination
    //         // const reports = await this.reportModel
    //         //   .find({ subcategory: subcategory._id })
    //         //   .countDocuments()
    //         //   .limit(limit)
    //         //   .skip(skip)
    //         //   .sort({ createdAt: -1 })
    //         //   .exec();


    //       }
    //     }
    //   }
    // }


    return {
      departments,
      pagination: {
        page,
        limit,
        totalDepartments,

      }
    };
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
