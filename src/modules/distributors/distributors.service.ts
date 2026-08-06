import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';
import { QueryDistributorsDto } from './dto/query-distributors.dto';

@Injectable()
export class DistributorsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: QueryDistributorsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: tenantId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { distributor_code: { contains: query.search, mode: 'insensitive' } },
        { company_name: { contains: query.search, mode: 'insensitive' } },
        { contact_person: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [distributors, total] = await Promise.all([
      this.prisma.distributor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.distributor.count({ where }),
    ]);

    return {
      data: distributors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, tenantId: string) {
    const distributor = await this.prisma.distributor.findUnique({ where: { id } });
    if (!distributor || distributor.tenant_id !== tenantId) {
      throw new NotFoundException('Distributor not found');
    }
    return distributor;
  }

  async create(tenantId: string, dto: CreateDistributorDto) {
    const existingCode = await this.prisma.distributor.findUnique({ where: { distributor_code: dto.distributorCode } });
    if (existingCode) {
      throw new Error('Distributor with this code already exists');
    }

    const existingEmail = await this.prisma.distributor.findUnique({ where: { email: dto.email } });
    if (existingEmail) {
      throw new Error('Distributor with this email already exists');
    }

    const distributor = await this.prisma.distributor.create({
      data: {
        tenant_id: tenantId,
        distributor_code: dto.distributorCode,
        company_name: dto.companyName,
        contact_person: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        commission_rate: dto.commissionRate,
        status: dto.status ?? 'ACTIVE',
      },
    });

    return distributor;
  }

  async update(id: string, tenantId: string, dto: UpdateDistributorDto) {
    const distributor = await this.findById(id, tenantId);

    const updated = await this.prisma.distributor.update({
      where: { id: distributor.id },
      data: {
        company_name: dto.companyName,
        contact_person: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        commission_rate: dto.commissionRate,
        status: dto.status,
      },
    });

    return updated;
  }

  async softDelete(id: string, tenantId: string) {
    const distributor = await this.findById(id, tenantId);

    await this.prisma.distributor.update({
      where: { id: distributor.id },
      data: { status: 'DELETED' as any },
    });

    return { success: true };
  }
}
