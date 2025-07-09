import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentOrderService } from '../../merchant/services/payment-order.service';

@Injectable()
export class PaymentOrderCleanupService {
  private readonly logger = new Logger(PaymentOrderCleanupService.name);

  constructor(private readonly paymentOrderService: PaymentOrderService) {}

  /**
   * Clean up expired payment orders every minute
   * This ensures that payment orders that have exceeded their TTL are automatically cancelled
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredPaymentOrders() {
    try {
      this.logger.debug('Starting expired payment order cleanup...');

      const cancelledCount =
        await this.paymentOrderService.cancelExpiredOrders();

      if (cancelledCount > 0) {
        this.logger.log(
          `Successfully cancelled ${cancelledCount} expired payment orders`,
        );
      } else {
        this.logger.debug('No expired payment orders found');
      }
    } catch (error) {
      this.logger.error('Error during payment order cleanup:', error.stack);
    }
  }
}
