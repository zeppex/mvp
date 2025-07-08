import { SetMetadata } from '@nestjs/common';

export const MERCHANT_ACCESS_KEY = 'merchantAccess';
export const MerchantAccess = () => SetMetadata(MERCHANT_ACCESS_KEY, true);
