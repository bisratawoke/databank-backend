import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
// import { PrismaService } from 'src/prisma/prisma.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';


@Injectable()
export class UserService {
    constructor(
        // private prisma: PrismaService,
        @InjectModel(User.name) private readonly userModel: Model<User>,

    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.userModel.findOne({
            email: createUserDto.email,
        }).exec();

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });

        return createdUser.save();
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().select('-password').populate('department').exec();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userModel.findById(id).populate('department').exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findByEmail(email: string): Promise<User> {
        return this.userModel.findOne({ email }).exec();
    }

    async findByPasswordResetToken(token: string): Promise<User> {
        return this.userModel.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() },
        }).exec();
    }

    async findByEmailVerificationToken(token: string): Promise<User> {
        return this.userModel.findOne({ emailVerificationToken: token }).exec();
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    }

    // Soft delete (deactivate user)
    async softRemove(id: string) {
        const user = await this.findOne(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (!user.isActive) {
            throw new NotFoundException('User already deactivated');
        }

        const deactivateUser = await this.userModel.findByIdAndUpdate(id, {
            isActive: false,
        }).exec();

        return deactivateUser;


    }

    // Remove a user (hard delete)
    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await this.userModel.findByIdAndDelete(id).exec();
    }

}