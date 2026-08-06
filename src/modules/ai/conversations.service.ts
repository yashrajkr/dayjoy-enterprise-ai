import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { QueryConversationsDto } from './dto/query-conversations.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: QueryConversationsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: tenantId,
    };

    if (query.agentId) {
      where.agent_id = query.agentId;
    }

    if (query.customerId) {
      where.customer_id = query.customerId;
    }

    if (query.userId) {
      where.user_id = query.userId;
    }

    if (query.channel) {
      where.channel = query.channel;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { started_at: 'desc' },
        include: {
          agent: true,
          customer: true,
          user: true,
          messages: {
            orderBy: { created_at: 'asc' },
          },
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return {
      data: conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createConversation(tenantId: string, dto: CreateConversationDto) {
    const conversation = await this.prisma.conversation.create({
      data: {
        tenant_id: tenantId,
        agent_id: dto.agentId,
        customer_id: dto.customerId,
        user_id: dto.userId,
        channel: dto.channel,
        status: 'active',
      },
      include: {
        agent: true,
        customer: true,
        user: true,
      },
    });

    return conversation;
  }

  async getConversationById(id: string, tenantId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        agent: true,
        customer: true,
        user: true,
        messages: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!conversation || conversation.tenant_id !== tenantId) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async sendMessage(tenantId: string, dto: SendMessageDto) {
    const conversation = await this.getConversationById(dto.conversationId, tenantId);

    const message = await this.prisma.message.create({
      data: {
        tenant_id: tenantId,
        conversation_id: conversation.id,
        role: dto.role,
        content: dto.content,
        content_type: 'text',
      },
    });

    return message;
  }
}
