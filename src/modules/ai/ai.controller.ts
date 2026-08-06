import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { ConversationsService } from './conversations.service';
import { MemoryService } from './memory.service';
import { ToolsService } from './tools.service';
import { QueryAgentsDto } from './dto/query-agents.dto';
import { QueryConversationsDto } from './dto/query-conversations.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpsertMemoryDto } from './dto/upsert-memory.dto';

@Controller('api/ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly conversationsService: ConversationsService,
    private readonly memoryService: MemoryService,
    private readonly toolsService: ToolsService,
  ) {}

  // Agents
  @Get('agents')
  async listAgents(@CurrentUser() user: any, @Query() query: QueryAgentsDto) {
    return this.aiService.listAgents(user.tenantId, query);
  }

  @Get('agents/:id')
  async getAgentById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.aiService.getAgentById(id, user.tenantId);
  }

  // Conversations
  @Get('conversations')
  async listConversations(@CurrentUser() user: any, @Query() query: QueryConversationsDto) {
    return this.conversationsService.list(user.tenantId, query);
  }

  @Post('conversations')
  async createConversation(@CurrentUser() user: any, @Body() dto: CreateConversationDto) {
    return this.conversationsService.createConversation(user.tenantId, dto);
  }

  @Get('conversations/:id')
  async getConversationById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.conversationsService.getConversationById(id, user.tenantId);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.conversationsService.sendMessage(user.tenantId, {
      conversationId: id,
      role: dto.role,
      content: dto.content,
    });
  }

  // Memory
  @Get('memory/user/:userId')
  async listUserMemory(@CurrentUser() user: any, @Param('userId') userId: string) {
    return this.memoryService.listForUser(user.tenantId, userId);
  }

  @Get('memory/customer/:customerId')
  async listCustomerMemory(@CurrentUser() user: any, @Param('customerId') customerId: string) {
    return this.memoryService.listForCustomer(user.tenantId, customerId);
  }

  @Post('memory')
  async upsertMemory(@CurrentUser() user: any, @Body() dto: UpsertMemoryDto) {
    return this.memoryService.upsertMemory(user.tenantId, dto);
  }

  // Tools
  @Post('tools/:toolName')
  async invokeTool(
    @Param('toolName') toolName: string,
    @Body() payload: Record<string, any>,
  ) {
    return this.toolsService.invokeTool(toolName, payload);
  }
}
