import { CreateMerchantDto } from '../dto/create-merchant.dto';
export class CreateMerchantCommand {
  constructor(public readonly dto: CreateMerchantDto) {}
}
