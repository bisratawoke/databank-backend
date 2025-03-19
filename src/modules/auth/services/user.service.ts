import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
// import { PrismaService } from 'src/prisma/prisma.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import {
  UserResponseDto,
  UsersResponseDto,
  userToDto,
} from '../dto/user/user-response.dto';
import { PaginationQueryDto } from '../../../common/dto/paginated-query.dto';
import { UserRole } from '../constants/user-role';

@Injectable()
export class UserService {
  constructor(
    // private prisma: PrismaService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userModel
      .findOne({
        email: createUserDto.email,
      })
      .exec();

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await (
      await createdUser.save()
    ).populate({
      path: 'department',
      populate: { path: 'category' },
    });

    return userToDto(savedUser) as UserResponseDto;
  }

  async findAll(): Promise<UserResponseDto[] | null> {
    const users = this.userModel
      .find()
      .populate({
        path: 'department',
        populate: { path: 'category' },
      })
      .exec();
    return userToDto(await users) as UserResponseDto[];
  }

  // async findAllPaginated(query: PaginationQueryDto): Promise<UsersResponseDto> {
  //   const {
  //     page = 1,
  //     limit = 10,
  //     search = '',
  //     sortBy = 'createdAt',
  //     sortOrder = 'desc',
  //   } = query;

  //   // Calculate skip value for pagination
  //   const skip = (page - 1) * limit;

  //   // Build search filter
  //   const searchFilter: any = {};
  //   if (search) {
  //     searchFilter.$or = [
  //       { email: { $regex: search, $options: 'i' } },
  //       { firstName: { $regex: search, $options: 'i' } },
  //       { lastName: { $regex: search, $options: 'i' } },
  //     ];
  //   }

  //   // Build sort object
  //   const sort: any = {};
  //   sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  //   try {
  //     // Execute queries in parallel using Promise.all
  //     const [users, total] = await Promise.all([
  //       this.userModel
  //         .find(searchFilter)
  //         .sort(sort)
  //         .skip(skip)
  //         .limit(limit)
  //         .populate({
  //           path: 'department',
  //           populate: { path: 'category' },
  //         })
  //         .exec(),
  //       this.userModel.countDocuments(searchFilter),
  //     ]);

  //     // Calculate pagination metadata
  //     const totalPages = Math.ceil(total / limit);
  //     const hasNextPage = page < totalPages;
  //     const hasPreviousPage = page > 1;

  //     return {
  //       users: userToDto(users) as UserResponseDto[],
  //       total,
  //       metadata: {
  //         currentPage: page,
  //         totalPages,
  //         pageSize: limit,
  //         totalCount: total,
  //         hasNextPage,
  //         hasPreviousPage,
  //       },
  //     };
  //   } catch (error) {
  //     console.error('Error in findAllPaginated:', error);
  //     throw new InternalServerErrorException('Failed to fetch paginated users');
  //   }
  // }

  async findAllPaginated(query: PaginationQueryDto): Promise<UsersResponseDto> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter: any = {};
    if (search) {
      searchFilter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    try {
      // Execute queries in parallel using Promise.all
      const [users, total] = await Promise.all([
        this.userModel
          .find(searchFilter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate({
            path: 'department',
            populate: { path: 'category' },
            strictPopulate: false, // ensures inclusion of users without a department
          })
          .exec(),
        this.userModel.countDocuments(searchFilter),
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        users: userToDto(users) as UserResponseDto[],
        total,
        metadata: {
          currentPage: page,
          totalPages,
          pageSize: limit,
          totalCount: total,
          hasNextPage,
          hasPreviousPage,
        },
      };
    } catch (error) {
      console.error('Error in findAllPaginated:', error);
      throw new InternalServerErrorException('Failed to fetch paginated users');
    }
  }

  async findDissimenationHead(): Promise<User[] | null> {
    const user = await this.userModel
      .find({ roles: UserRole.DISSEMINATION_HEAD })
      .exec();
    return user;
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userModel
      .findById(id)
      .populate({
        path: 'department',
        populate: { path: 'category' },
      })
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return userToDto(user) as UserResponseDto;
  }

  async findOneWithCredentials(email: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({ email })
      .populate({
        path: 'department',
        populate: { path: 'category' },
      })
      .exec();
    return user;
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userModel
      .findOne({ email })
      .populate({
        path: 'department',
        populate: { path: 'category' },
      })
      .exec();

    return user ? (userToDto(user) as UserResponseDto) : null;
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.userModel
      .findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      })
      .exec();
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.userModel.findOne({ emailVerificationToken: token }).exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .populate({
        path: 'department',
        populate: { path: 'category' },
      })
      .exec();

    return userToDto(updatedUser) as UserResponseDto;
  }

  // Soft delete (deactivate user)
  async softRemove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.isActive) {
      throw new NotFoundException('User already deactivated');
    }

    await this.userModel
      .findByIdAndUpdate(id, {
        isActive: false,
      })
      .exec();
  }

  // Remove a user (hard delete)
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userModel.findByIdAndDelete(id).exec();
  }
}
