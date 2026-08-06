import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';
import { UserMetricsDto } from './dto/user-metrics.dto';
import { OrderMetricsDto } from './dto/order-metrics.dto';
import { AiMetricsDto } from './dto/ai-metrics.dto';
import { KnowledgeMetricsDto } from './dto/knowledge-metrics.dto';

@Controller('api/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Analytics - ADMIN or MANAGER
  @Roles('ADMIN', 'MANAGER')
  @Get('users')
  async getUserMetrics(@CurrentUser() user: any, @Query() query: UserMetricsDto) {
    return this.analyticsService.getUserMetrics(user.tenantId, query);
  }

  @Roles('ADMIN', 'MANAGER')
  @Get('orders')
  async getOrderMetrics(@CurrentUser() user: any, @Query() query: OrderMetricsDto) {
    return this.analyticsService.getOrderMetrics(user.tenantId, query);
  }

  @Roles('ADMIN', 'MANAGER')
  @Get('ai')
  async getAiMetrics(@CurrentUser() user: any, @Query() query: AiMetricsDto) {
    return this.analyticsService.getAiMetrics(user.tenantId, query);
  }

  @Roles('ADMIN', 'MANAGER')
  @Get('knowledge')
  async getKnowledgeMetrics(@CurrentUser() user: any, @Query() query: KnowledgeMetricsDto) {
    return this.analyticsService.getKnowledgeMetrics(user.tenantId, query);
  }

  @Roles('ADMIN', 'MANAGER')
  @Get('dashboard')
  async getDashboardSummary(@CurrentUser() user: any) {
    return this.analyticsService.getDashboardSummary(user.tenantId);
  }
}
