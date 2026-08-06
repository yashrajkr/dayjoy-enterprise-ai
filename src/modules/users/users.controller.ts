import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list(@CurrentUser() user: any, @Query() query: QueryUsersDto) {
    return this.usersService.list(user.tenantId, query);
  }

  @Get(':id')
  async getById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.findById(id, user.tenantId);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    // For now, tenantId is taken from dto directly; later we will enforce RBAC.
    return this.usersService.create(dto);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  async softDelete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.softDelete(id, user.tenantId);
  }
}
