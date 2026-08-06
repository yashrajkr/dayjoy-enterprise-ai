import { IsOptional, IsString, IsEnum } from 'class-validator';
import { NotificationChannel } from './send-notification.dto';

export enum NotificationEventType {
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  AI_CONVERSATION_EVENT = 'AI_CONVERSATION_EVENT',
}

export class NotificationEventDto {
  @IsEnum(NotificationEventType)
  type: NotificationEventType;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsString()
  recipient: string;

  @IsOptional()
  payload?: Record<string, any>;
}
