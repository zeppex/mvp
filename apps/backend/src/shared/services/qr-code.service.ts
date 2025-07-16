import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrCodeService {
  private readonly logger = new Logger(QrCodeService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generate a payment link URL for a POS that links to the current payment order
   * @param merchantId - The merchant ID
   * @param branchId - The branch ID
   * @param posId - The POS ID
   * @returns Payment link URL that can be used to generate QR codes client-side
   */
  generatePosPaymentLink(
    merchantId: string,
    branchId: string,
    posId: string,
  ): string {
    const baseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    // Point to the public payment order page
    const paymentLink = `${baseUrl}/payment/${posId}`;

    this.logger.log(`Generated payment link for POS ${posId}: ${paymentLink}`);

    return paymentLink;
  }

  /**
   * Generate a simplified payment link URL (POS ID only)
   * @param posId - The POS ID
   * @returns Simplified payment link URL
   */
  generateSimplifiedPosPaymentLink(posId: string): string {
    const baseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const paymentLink = `${baseUrl}/payment/${posId}`;

    this.logger.log(
      `Generated simplified payment link for POS ${posId}: ${paymentLink}`,
    );

    return paymentLink;
  }

  /**
   * Generate a complete payment link for a POS (for backward compatibility)
   * @param merchantId - The merchant ID
   * @param branchId - The branch ID
   * @param posId - The POS ID
   * @returns Object containing the payment link URL
   */
  generatePosQrCode(merchantId: string, branchId: string, posId: string) {
    const paymentLink = this.generatePosPaymentLink(
      merchantId,
      branchId,
      posId,
    );

    return {
      url: paymentLink,
      // Note: QR code images are now generated client-side
      imageUrl: null,
    };
  }

  /**
   * Generate a simplified payment link for a POS (for backward compatibility)
   * @param posId - The POS ID
   * @returns Object containing the payment link URL
   */
  generateSimplifiedPosQrCode(posId: string) {
    const paymentLink = this.generateSimplifiedPosPaymentLink(posId);

    return {
      url: paymentLink,
      // Note: QR code images are now generated client-side
      imageUrl: null,
    };
  }
}
