import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserRoleDto, UserRole } from './dto/update-user-role.dto';
import { CreateTenantConfigDto } from './dto/create-tenant-config.dto';
import { UpdateTenantConfigDto } from './dto/update-tenant-config.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenant_id: tenantId },
      include: {
        employee: true,
        customer: true,
        distributor: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getUserById(id: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        employee: true,
        customer: true,
        distributor: true,
      },
    });

    if (!user || user.tenant_id !== tenantId) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserRole(tenantId: string, dto: UpdateUserRoleDto) {
    const user = await this.getUserById(dto.userId, tenantId);

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { role: dto.role as any },
    });

    return updated;
  }

  async listTenants() {
    return this.prisma.tenant.findMany({
      include: {
        users: {
          select: { id: true, role: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getTenantById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        users: true,
        employees: true,
        customers: true,
        distributors: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async listTenantConfig(tenantId: string) {
    return this.prisma.tenantConfig.findMany({
      where: { tenant_id: tenantId },
      orderBy: { key: 'asc' },
    });
  }

  async createTenantConfig(tenantId: string, dto: CreateTenantConfigDto) {
    const config = await this.prisma.tenantConfig.create({
      data: {
        tenant_id: tenantId,
        key: dto.key,
        value: dto.value,
        description: dto.description,
      },
    });

    return config;
  }

  async updateTenantConfig(tenantId: string, dto: UpdateTenantConfigDto) {
    const existing = await this.prisma.tenantConfig.findUnique({
      where: {
        tenant_id_key: {
          tenant_id: tenantId,
          key: dto.key,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Tenant config not found');
    }

    const updated = await this.prisma.tenantConfig.update({
      where: {
        tenant_id_key: {
          tenant_id: tenantId,
          key: dto.key,
        },
      },
      data: {
        value: dto.value ?? existing.value,
        description: dto.description ?? existing.description,
      },
    });

    return updated;
  }

  async deleteTenantConfig(tenantId: string, key: string) {
    const existing = await this.prisma.tenantConfig.findUnique({
      where: {
        tenant_id_key: {
          tenant_id: tenantId,
          key,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Tenant config not found');
    }

    await this.prisma.tenantConfig.delete({
      where: {
        tenant_id_key: {
          tenant_id: tenantId,
          key,
        },
      },
    });

    return { success: true };
  }

  async getSystemStats() {
    const [totalTenants, totalUsers, totalCustomers, totalDistributors, totalEmployees] =
      await Promise.all([
        this.prisma.tenant.count(),
        this.prisma.user.count(),
        this.prisma.customer.count(),
        this.prisma.distributor.count(),
        this.prisma.employee.count(),
      ]);

    return {
      totalTenants,
      totalUsers,
      totalCustomers,
      totalDistributors,
      totalEmployees,
    };
  }
}
