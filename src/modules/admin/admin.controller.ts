import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CreateTenantConfigDto } from './dto/create-tenant-config.dto';
import { UpdateTenantConfigDto } from './dto/update-tenant-config.dto';

@Controller('api/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Users - ADMIN only
  @Roles('ADMIN')
  @Get('users')
  async listUsers(@CurrentUser() user: any) {
    return this.adminService.listUsers(user.tenantId);
  }

  @Roles('ADMIN')
  @Get('users/:id')
  async getUserById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.getUserById(id, user.tenantId);
  }

  @Roles('ADMIN')
  @Put('users/role')
  async updateUserRole(@CurrentUser() user: any, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(user.tenantId, dto);
  }

  // Tenants - ADMIN only (global admin)
  @Roles('ADMIN')
  @Get('tenants')
  async listTenants() {
    return this.adminService.listTenants();
  }

  @Roles('ADMIN')
  @Get('tenants/:id')
  async getTenantById(@Param('id') id: string) {
    return this.adminService.getTenantById(id);
  }

  // Tenant config - ADMIN only
  @Roles('ADMIN')
  @Get('config')
  async listTenantConfig(@CurrentUser() user: any) {
    return this.adminService.listTenantConfig(user.tenantId);
  }

  @Roles('ADMIN')
  @Post('config')
  async createTenantConfig(@CurrentUser() user: any, @Body() dto: CreateTenantConfigDto) {
    return this.adminService.createTenantConfig(user.tenantId, dto);
  }

  @Roles('ADMIN')
  @Put('config')
  async updateTenantConfig(@CurrentUser() user: any, @Body() dto: UpdateTenantConfigDto) {
    return this.adminService.updateTenantConfig(user.tenantId, dto);
  }

  @Roles('ADMIN')
  @Delete('config/:key')
  async deleteTenantConfig(@CurrentUser() user: any, @Param('key') key: string) {
    return this.adminService.deleteTenantConfig(user.tenantId, key);
  }

  // System stats - ADMIN only
  @Roles('ADMIN')
  @Get('stats')
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }
}
