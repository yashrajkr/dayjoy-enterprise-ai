import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { QueryEmployeesDto } from './dto/query-employees.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async list(@CurrentUser() user: any, @Query() query: QueryEmployeesDto) {
    return this.employeesService.list(user.tenantId, query);
  }

  @Get(':id')
  async getById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.employeesService.findById(id, user.tenantId);
  }

  @Put(':id/status')
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeStatusDto,
  ) {
    return this.employeesService.updateStatus(id, user.tenantId, dto);
  }
}
