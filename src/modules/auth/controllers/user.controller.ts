import { Request, Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

import { UserService } from '../services/user.service';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from '../guards/role.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserRole } from '../constants/user-role';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { CurrentUser } from 'src/decorators/current-user.decoratro';
import { UserDto } from '../dto/user/user.dto';
import { User } from '@prisma/client';
import { UserResponseDto, userToDto } from '../dto/login-response.dto';
import { AuthUserInterceptor } from 'src/interceptors/auth-user.interceptor';
import { SuccessDto } from 'src/common/dto/success.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuthUserInterceptor)
@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UserService,
    ) { }


    @ApiOperation({ summary: 'Retrieve a current logged in user' })
    @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ type: UserDto })
    @Get('me')
    getCurrentUser(@CurrentUser() user: User): UserResponseDto {
        return userToDto(user);
    }

    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @Roles(UserRole.ADMIN)
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @ApiOperation({ summary: 'Retrieve all users' })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_HEAD)
    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @ApiOperation({ summary: 'Retrieve a specific user by ID' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_HEAD)
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.userService.findOne(id);
    }


    @ApiOperation({ summary: 'Update my profile' })
    @ApiResponse({ status: 200, description: 'User updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiResponse({ type: UserResponseDto })
    @Patch('me')
    updateMe(@CurrentUser() user: User, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(user.id, updateUserDto);
    }

    @ApiOperation({ summary: 'Update a user' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User updated successfully.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }

    @ApiOperation({ summary: 'Delete a user' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User deleted successfully.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: number): Promise<SuccessDto> {
        await this.userService.remove(id);
        return { success: true };
    }

    @ApiOperation({ summary: 'Soft delete a user' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User deleted successfully.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @Roles(UserRole.ADMIN)
    @Delete(':id/soft')
    async softRemove(@Param('id') id: number): Promise<SuccessDto> {
        await this.userService.softRemove(id);
        return { success: true };
    }
}
