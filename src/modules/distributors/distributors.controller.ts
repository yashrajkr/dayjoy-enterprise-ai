import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DistributorsService } from './distributors.service';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';
import { QueryDistributorsDto } from './dto/query-distributors.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/distributors')
@UseGuards(JwtAuthGuard)
export class DistributorsController {
  constructor(private readonly distributorsService: DistributorsService) {}

  @Get()
  async list(@CurrentUser() user: any, @Query() query: QueryDistributorsDto) {
    return this.distributorsService.list(user.tenantId, query);
  }

  @Get(':id')
  async getById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.distributorsService.findById(id, user.tenantId);
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateDistributorDto) {
    return this.distributorsService.create(user.tenantId, dto);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateDistributorDto,
  ) {
    return this.distributorsService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  async softDelete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.distributorsService.softDelete(id, user.tenantId);
  }
}
