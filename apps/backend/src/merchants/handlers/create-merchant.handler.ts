import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MerchantsService, Merchant } from '../merchants.service';
import { CreateMerchantCommand } from '../commands/create-merchant.command';

@CommandHandler(CreateMerchantCommand)
export class CreateMerchantHandler implements ICommandHandler<CreateMerchantCommand> {
  constructor(private readonly service: MerchantsService) {}

  execute(command: CreateMerchantCommand): Merchant {
    return this.service.createMerchant(command.dto);
  }
}
