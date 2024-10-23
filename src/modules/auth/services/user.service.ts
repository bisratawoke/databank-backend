import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { UserDto } from '../dto/user/user.dto';
import { UserResponseDto, userToDto } from '../dto/login-response.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        return this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                roles: true,
                department: true,
                isActive: true,
                createdAt: true,
            },
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                roles: true,
                department: true,
                isActive: true,
                lastLogin: true,
            },
        });
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: Number(id) },
            include: {
                activityLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findByPasswordResetToken(token: string) {
        return this.prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: { gt: new Date() },
            },
        });
    }

    async findByEmailVerificationToken(token: string) {
        return this.prisma.user.findFirst({
            where: { emailVerificationToken: token },
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.findOne(id);

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        })

    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.user.delete({ where: { id } });
    }

    async softRemove(id: number) {
        await this.findOne(id);
        await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    }
}