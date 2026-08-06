import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { QueryAgentsDto } from './dto/query-agents.dto';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async listAgents(tenantId: string, query: QueryAgentsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: tenantId,
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [agents, total] = await Promise.all([
      this.prisma.aiAgent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.aiAgent.count({ where }),
    ]);

    return {
      data: agents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAgentById(id: string, tenantId: string) {
    const agent = await this.prisma.aiAgent.findUnique({ where: { id } });
    if (!agent || agent.tenant_id !== tenantId) {
      throw new Error('AI Agent not found');
    }
    return agent;
  }
}
