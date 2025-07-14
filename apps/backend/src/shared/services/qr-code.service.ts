import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrCodeService {
  private readonly logger = new Logger(QrCodeService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generate a QR code URL for a POS that links to the current payment order
   * @param merchantId - The merchant ID
   * @param branchId - The branch ID
   * @param posId - The POS ID
   * @returns QR code URL that can be used with external QR code generation services
   */
  generatePosQrCodeUrl(
    merchantId: string,
    branchId: string,
    posId: string,
  ): string {
    const baseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    // Check if we should use the new simplified format
    const useSimplifiedFormat = this.configService.get<boolean>(
      'USE_SIMPLIFIED_QR_URLS',
      false,
    );

    let qrCodeUrl: string;

    if (useSimplifiedFormat) {
      // New simplified format: /payment/{posId}
      qrCodeUrl = `${baseUrl}/payment/${posId}`;
    } else {
      // Legacy format: /payment/{merchantId}/{branchId}/{posId}
      qrCodeUrl = `${baseUrl}/payment/${merchantId}/${branchId}/${posId}`;
    }

    this.logger.log(`Generated QR code URL for POS ${posId}: ${qrCodeUrl}`);

    return qrCodeUrl;
  }

  /**
   * Generate a QR code using an external service (Google Charts API)
   * @param data - The data to encode in the QR code
   * @param size - The size of the QR code (default: 200x200)
   * @returns URL to the generated QR code image
   */
  generateQrCodeImage(data: string, size: number = 200): string {
    const encodedData = encodeURIComponent(data);
    const qrCodeImageUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodedData}`;

    this.logger.log(`Generated QR code image URL: ${qrCodeImageUrl}`);

    return qrCodeImageUrl;
  }

  /**
   * Generate a complete QR code for a POS with both URL and image
   * @param merchantId - The merchant ID
   * @param branchId - The branch ID
   * @param posId - The POS ID
   * @returns Object containing both the URL and image URL
   */
  generatePosQrCode(merchantId: string, branchId: string, posId: string) {
    const qrCodeUrl = this.generatePosQrCodeUrl(merchantId, branchId, posId);
    const qrCodeImageUrl = this.generateQrCodeImage(qrCodeUrl);

    return {
      url: qrCodeUrl,
      imageUrl: qrCodeImageUrl,
    };
  }

  /**
   * Generate a simplified QR code URL (POS ID only)
   * @param posId - The POS ID
   * @returns Simplified QR code URL
   */
  generateSimplifiedPosQrCodeUrl(posId: string): string {
    const baseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const qrCodeUrl = `${baseUrl}/payment/${posId}`;

    this.logger.log(`Generated simplified QR code URL for POS ${posId}: ${qrCodeUrl}`);

    return qrCodeUrl;
  }

  /**
   * Generate a simplified QR code for a POS
   * @param posId - The POS ID
   * @returns Object containing both the URL and image URL
   */
  generateSimplifiedPosQrCode(posId: string) {
    const qrCodeUrl = this.generateSimplifiedPosQrCodeUrl(posId);
    const qrCodeImageUrl = this.generateQrCodeImage(qrCodeUrl);

    return {
      url: qrCodeUrl,
      imageUrl: qrCodeImageUrl,
    };
  }
}
