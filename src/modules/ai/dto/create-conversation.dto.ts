import { IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  agentId: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  channel: string; // VOICE, WHATSAPP, WEB, API
}
