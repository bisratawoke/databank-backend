import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { ChatterService } from './chatter.service';
import { CreateChatterDto, UpdateChatterDto } from './dto/chatter.dto';
import { CreateMessageDto } from './dto/message.dto';

@ApiTags('Chatter')
@Controller('chatter')
export class ChatterController {
  constructor(private readonly chatterService: ChatterService) {}

  @Get('subject/:id')
  @ApiOperation({ summary: 'Retrieve chat using subject id' })
  async findChatByEntity(@Param('id') id: string) {
    return this.chatterService.getChatBySubjectId(id);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all chatters' })
  async findAll(@Query() query: any) {
    return this.chatterService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific chatter by ID' })
  @ApiParam({ name: 'id', description: 'Chatter ID' })
  async findOne(@Param('id') id: string) {
    return this.chatterService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new chatter' })
  @ApiBody({ type: CreateChatterDto })
  async create(@Body() createChatterDto: any) {
    return this.chatterService.create(createChatterDto);
  }

  @Post(':id')
  @ApiOperation({ summary: 'Create a new message' })
  @ApiBody({ type: CreateMessageDto })
  async createMessage(
    @Param('id') id: string,
    @Body('message') message: any,
    @Body('userId') userId: string,
  ) {
    return this.chatterService.createMessage({
      message: message,
      userId,
      chatterId: id,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a specific chatter by ID' })
  @ApiParam({ name: 'id', description: 'Chatter ID' })
  @ApiBody({ type: UpdateChatterDto })
  async update(
    @Param('id') id: string,
    @Body() updateChatterDto: UpdateChatterDto,
  ) {
    return this.chatterService.update(id, updateChatterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific chatter by ID' })
  @ApiParam({ name: 'id', description: 'Chatter ID' })
  async delete(@Param('id') id: string) {
    return this.chatterService.delete(id);
  }
}
