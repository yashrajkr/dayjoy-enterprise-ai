import { IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  role: string; // user, assistant, system

  @IsString()
  content: string;
}
