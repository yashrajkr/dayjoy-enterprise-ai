import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConversationsService } from './conversations.service';
import { MemoryService } from './memory.service';
import { ToolsService } from './tools.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [AiService, ConversationsService, MemoryService, ToolsService],
  exports: [AiService, ConversationsService, MemoryService, ToolsService],
})
export class AiModule {}
