import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async list(tenantId: string, query: QueryUsersDto) {
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
        { first_name: { contains: query.search, mode: 'insensitive' } },
        { last_name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.tenant_id !== tenantId) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new Error('User with this email already exists');
    }

    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await this.hashPassword(dto.password);
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password_hash: passwordHash,
        first_name: dto.firstName,
        last_name: dto.lastName,
        phone: dto.phone,
        tenant_id: dto.tenantId,
        status: (dto.status as any) ?? 'ACTIVE',
      },
    });

    return user;
  }

  async update(id: string, tenantId: string, dto: UpdateUserDto) {
    const user = await this.findById(id, tenantId);

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        first_name: dto.firstName,
        last_name: dto.lastName,
        phone: dto.phone,
        status: dto.status as any,
      },
    });

    return updated;
  }

  async softDelete(id: string, tenantId: string) {
    const user = await this.findById(id, tenantId);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { status: 'DELETED' as any },
    });

    return { success: true };
  }
}
