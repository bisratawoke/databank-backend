import { Request, Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

import { UserService } from '../services/user.service';

import { RolesGuard } from '../guards/role.guard';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { UserRole } from '../constants/user-role';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { UserDto } from '../dto/user/user.dto';
import { UserResponseDto, userToDto } from '../dto/login-response.dto';
import { SuccessDto } from 'src/common/dto/success.dto';
import { User } from '../schemas/user.schema';
import { AuthUserInterceptor } from '../../../interceptors/auth-user.interceptor';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
  @ApiResponse({ type: UserResponseDto })
  @Get('me')
  async getCurrentUser(@CurrentUser() user: User) {
    const userFound = await this.userService.findByEmail(user.email);
    return userToDto(userFound);
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
  findOne(@Param('id') id: string) {
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
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<SuccessDto> {
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
  async softRemove(@Param('id') id: string): Promise<SuccessDto> {
    await this.userService.softRemove(id);
    return { success: true };
  }
}
