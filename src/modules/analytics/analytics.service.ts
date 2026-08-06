import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserMetricsDto } from './dto/user-metrics.dto';
import { OrderMetricsDto } from './dto/order-metrics.dto';
import { AiMetricsDto } from './dto/ai-metrics.dto';
import { KnowledgeMetricsDto } from './dto/knowledge-metrics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserMetrics(tenantId: string, query: UserMetricsDto) {
    const days = query.days ?? 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: any = {
      tenant_id: tenantId,
      created_at: { gte: since },
    };

    if (query.role) {
      where.role = query.role;
    }

    const [totalUsers, activeUsers, usersByRole] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.count({
        where: {
          ...where,
          last_login_at: { gte: since },
        },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        where,
        _count: { id: true },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      usersByRole: usersByRole.map((r) => ({
        role: r.role,
        count: r._count.id,
      })),
      periodDays: days,
    };
  }

  async getOrderMetrics(tenantId: string, query: OrderMetricsDto) {
    const days = query.days ?? 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: any = {
      tenant_id: tenantId,
      created_at: { gte: since },
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customer_id = query.customerId;
    }

    const [totalOrders, ordersByStatus, revenue] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      this.prisma.order.aggregate({
        where,
        _sum: { total_amount: true },
      }),
    ]);

    return {
      totalOrders,
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      totalRevenue: revenue._sum.total_amount ?? 0,
      periodDays: days,
    };
  }

  async getAiMetrics(tenantId: string, query: AiMetricsDto) {
    const days = query.days ?? 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const convWhere: any = {
      tenant_id: tenantId,
      started_at: { gte: since },
    };

    if (query.agentId) {
      convWhere.agent_id = query.agentId;
    }

    if (query.channel) {
      convWhere.channel = query.channel;
    }

    const [totalConversations, conversationsByAgent, conversationsByChannel] = await Promise.all([
      this.prisma.conversation.count({ where: convWhere }),
      this.prisma.conversation.groupBy({
        by: ['agent_id'],
        where: convWhere,
        _count: { id: true },
      }),
      this.prisma.conversation.groupBy({
        by: ['channel'],
        where: convWhere,
        _count: { id: true },
      }),
    ]);

    const messageCount = await this.prisma.message.count({
      where: {
        tenant_id: tenantId,
        conversation: convWhere,
      },
    });

    return {
      totalConversations,
      conversationsByAgent: conversationsByAgent.map((a) => ({
        agentId: a.agent_id,
        count: a._count.id,
      })),
      conversationsByChannel: conversationsByChannel.map((c) => ({
        channel: c.channel,
        count: c._count.id,
      })),
      totalMessages: messageCount,
      periodDays: days,
    };
  }

  async getKnowledgeMetrics(tenantId: string, query: KnowledgeMetricsDto) {
    const days = query.days ?? 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const queryWhere: any = {
      tenant_id: tenantId,
      created_at: { gte: since },
    };

    const [totalQueries, queriesBySource] = await Promise.all([
      this.prisma.ragQuery.count({ where: queryWhere }),
      this.prisma.ragQuery.groupBy({
        by: ['source_id'],
        where: queryWhere,
        _count: { id: true },
      }),
    ]);

    const totalSources = await this.prisma.ragSource.count({
      where: {
        tenant_id: tenantId,
        created_at: { gte: since },
      },
    });

    return {
      totalQueries,
      queriesBySource: queriesBySource.map((s) => ({
        sourceId: s.source_id,
        count: s._count.id,
      })),
      totalSources,
      periodDays: days,
    };
  }

  async getDashboardSummary(tenantId: string) {
    const [users, orders, ai, knowledge] = await Promise.all([
      this.getUserMetrics(tenantId, { days: 30 }),
      this.getOrderMetrics(tenantId, { days: 30 }),
      this.getAiMetrics(tenantId, { days: 30 }),
      this.getKnowledgeMetrics(tenantId, { days: 30 }),
    ]);

    return {
      users,
      orders,
      ai,
      knowledge,
    };
  }
}
