import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { DataService } from './data.service';
import { CreateDataDto } from './dto/create-data.dto';
import { UpdateDataDto } from './dto/update-data.dto';

@Controller('data')
export class DataController {
    constructor(private readonly dataService: DataService) { }

    @Post()
    async create(@Body() createDataDto: CreateDataDto) {
        return this.dataService.create(createDataDto);
    }

    @Get()
    async findAll() {
        return this.dataService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.dataService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateDataDto: UpdateDataDto) {
        return this.dataService.update(id, updateDataDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.dataService.remove(id);
    }
}
