import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { QueryEmployeesDto } from './dto/query-employees.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: QueryEmployeesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // Employees are users who have roles like 'Agent', 'Manager', 'Employee'
    const roleFilter = query.roleName
      ? {
          some: {
            role: {
              name: query.roleName,
              tenant_id: tenantId,
            },
          },
        }
      : {
          some: {
            role: {
              tenant_id: tenantId,
            },
          },
        };

    const where: any = {
      tenant_id: tenantId,
      userRoles: roleFilter,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { first_name: { contains: query.search, mode: 'insensitive' } },
        { last_name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [employees, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.tenant_id !== tenantId) {
      throw new NotFoundException('Employee not found');
    }

    return user;
  }

  async updateStatus(id: string, tenantId: string, dto: UpdateEmployeeStatusDto) {
    const user = await this.findById(id, tenantId);

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        status: dto.status as any,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return updated;
  }
}
