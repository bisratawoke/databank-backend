import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotifireService } from './notifire.service';
import { CreateNotifireDto } from './dto/create-notifire.dto';
import { UpdateNotifireDto } from './dto/update-notifire.dto';
import { Notifire } from './schemas/notifire.schema';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthUserInterceptor } from 'src/interceptors/auth-user.interceptor';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('notifire')
@Controller('notifire')
export class NotifireController {
  constructor(private readonly notifiresService: NotifireService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notifire' })
  @ApiResponse({
    status: 201,
    description: 'Notifire successfully created.',
    type: Notifire,
  })
  async create(
    @Body() createNotifireDto: CreateNotifireDto,
  ): Promise<Notifire> {
    return this.notifiresService.create(createNotifireDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all notifires' })
  @ApiResponse({
    status: 200,
    description: 'List of notifires',
    type: [Notifire],
  })
  async findAll(@Request() req): Promise<Notifire[]> {
    return this.notifiresService.findAll(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notifire by ID' })
  @ApiResponse({ status: 200, description: 'Notifire found', type: Notifire })
  @ApiResponse({ status: 404, description: 'Notifire not found' })
  async findOne(@Param('id') id: string): Promise<Notifire> {
    return this.notifiresService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a notifire by ID' })
  @ApiResponse({
    status: 200,
    description: 'Notifire successfully updated',
    type: Notifire,
  })
  @ApiResponse({ status: 404, description: 'Notifire not found' })
  async update(
    @Param('id') id: string,
    @Body() updateNotifireDto: UpdateNotifireDto,
  ): Promise<Notifire> {
    return this.notifiresService.update(id, updateNotifireDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notifire by ID' })
  @ApiResponse({
    status: 200,
    description: 'Notifire successfully deleted',
    type: Notifire,
  })
  @ApiResponse({ status: 404, description: 'Notifire not found' })
  async remove(@Param('id') id: string): Promise<Notifire> {
    return this.notifiresService.remove(id);
  }
}
