import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: QueryCustomersDto) {
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
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { first_name: { contains: query.search, mode: 'insensitive' } },
        { last_name: { contains: query.search, mode: 'insensitive' } },
        { company_name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, tenantId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer || customer.tenant_id !== tenantId) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async create(tenantId: string, dto: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({
      data: {
        tenant_id: tenantId,
        customer_type: dto.customerType,
        company_name: dto.companyName,
        first_name: dto.firstName,
        last_name: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        status: dto.status ?? 'active',
      },
    });

    return customer;
  }

  async update(id: string, tenantId: string, dto: UpdateCustomerDto) {
    const customer = await this.findById(id, tenantId);

    const updated = await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        customer_type: dto.customerType,
        company_name: dto.companyName,
        first_name: dto.firstName,
        last_name: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        status: dto.status,
      },
    });

    return updated;
  }

  async softDelete(id: string, tenantId: string) {
    const customer = await this.findById(id, tenantId);

    await this.prisma.customer.update({
      where: { id: customer.id },
      data: { status: 'deleted' },
    });

    return { success: true };
  }
}
