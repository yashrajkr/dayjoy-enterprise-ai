import { Injectable, Logger } from '@nestjs/common';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationEventDto, NotificationEventType } from './dto/notification-event.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async send(dto: SendNotificationDto) {
    // In a real implementation, you would integrate with providers:
    // - Email (SendGrid, SES, etc.)
    // - SMS (Twilio, etc.)
    // - WhatsApp (Meta Business API)
    // - In-app notifications (WebSocket / push)

    this.logger.log(`Sending notification via ${dto.channel} to ${dto.recipient}: ${dto.subject}`);

    // Placeholder implementation: log and return success.
    return { success: true };
  }

  async handleEvent(event: NotificationEventDto) {
    this.logger.log(`Handling notification event: ${event.type} for ${event.recipient}`);

    switch (event.type) {
      case NotificationEventType.PASSWORD_RESET: {
        const dto: SendNotificationDto = {
          channel: event.channel,
          recipient: event.recipient,
          subject: 'Dayjoy Password Reset',
          body: 'You requested a password reset. If this was not you, please ignore this message.',
          metadata: event.payload,
        };
        return this.send(dto);
      }
      case NotificationEventType.EMAIL_VERIFICATION: {
        const dto: SendNotificationDto = {
          channel: event.channel,
          recipient: event.recipient,
          subject: 'Dayjoy Email Verification',
          body: 'Please verify your email to complete your registration.',
          metadata: event.payload,
        };
        return this.send(dto);
      }
      case NotificationEventType.ORDER_CREATED: {
        const dto: SendNotificationDto = {
          channel: event.channel,
          recipient: event.recipient,
          subject: 'Dayjoy Order Confirmation',
          body: 'Your order has been created successfully.',
          metadata: event.payload,
        };
        return this.send(dto);
      }
      case NotificationEventType.ORDER_STATUS_CHANGED: {
        const dto: SendNotificationDto = {
          channel: event.channel,
          recipient: event.recipient,
          subject: 'Dayjoy Order Status Update',
          body: 'Your order status has been updated.',
          metadata: event.payload,
        };
        return this.send(dto);
      }
      case NotificationEventType.AI_CONVERSATION_EVENT: {
        const dto: SendNotificationDto = {
          channel: event.channel,
          recipient: event.recipient,
          subject: 'Dayjoy AI Conversation Event',
          body: 'There is an update related to your AI conversation.',
          metadata: event.payload,
        };
        return this.send(dto);
      }
      default: {
        this.logger.warn(`Unhandled notification event type: ${event.type}`);
        return { success: false, reason: 'Unhandled event type' };
      }
    }
  }
}
