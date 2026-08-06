import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  APP = 'APP',
}

export class SendNotificationDto {
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsString()
  recipient: string; // email, phone, WhatsApp number, or userId for APP

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
