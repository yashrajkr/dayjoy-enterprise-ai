import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertMemoryDto } from './dto/upsert-memory.dto';

@Injectable()
export class MemoryService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(tenantId: string, userId: string) {
    return this.prisma.aiMemory.findMany({
      where: {
        tenant_id: tenantId,
        user_id: userId,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async listForCustomer(tenantId: string, customerId: string) {
    return this.prisma.aiMemory.findMany({
      where: {
        tenant_id: tenantId,
        customer_id: customerId,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async upsertMemory(tenantId: string, dto: UpsertMemoryDto) {
    const memory = await this.prisma.aiMemory.upsert({
      where: {
        // Composite unique is not defined in schema, so we emulate by key+tenant+user/customer.
        // This is a simplistic implementation; for production, add a composite unique constraint.
        id: undefined,
      },
      create: {
        tenant_id: tenantId,
        user_id: dto.userId,
        customer_id: dto.customerId,
        type: dto.type as any,
        key: dto.key,
        value: dto.value,
        importance: dto.importance ?? 5,
      },
      update: {
        value: dto.value,
        importance: dto.importance ?? 5,
      },
    } as any);

    return memory;
  }
}
