import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { KnowledgeService } from './knowledge.service';
import { IngestSourceDto } from './dto/ingest-source.dto';
import { QueryKnowledgeDto } from './dto/query-knowledge.dto';
import { QuerySourcesDto } from './dto/query-sources.dto';

@Controller('api/knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  // Sources
  @Get('sources')
  async listSources(@CurrentUser() user: any, @Query() query: QuerySourcesDto) {
    return this.knowledgeService.listSources(user.tenantId, query);
  }

  @Get('sources/agent/:agentId')
  async getSourcesByAgent(@CurrentUser() user: any, @Param('agentId') agentId: string) {
    return this.knowledgeService.getSourcesByAgent(user.tenantId, agentId);
  }

  // Ingest
  @Post('ingest')
  async ingestSource(@CurrentUser() user: any, @Body() dto: IngestSourceDto) {
    return this.knowledgeService.ingestSource(user.tenantId, dto);
  }

  // Query
  @Post('query')
  async queryKnowledge(@CurrentUser() user: any, @Body() dto: QueryKnowledgeDto) {
    return this.knowledgeService.queryKnowledge(user.tenantId, dto);
  }
}
