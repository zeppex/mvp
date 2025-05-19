import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MerchantsService, Pos } from '../merchants.service';
import { CreatePosCommand } from '../commands/create-pos.command';

@CommandHandler(CreatePosCommand)
export class CreatePosHandler implements ICommandHandler<CreatePosCommand> {
  constructor(private readonly service: MerchantsService) {}

  execute(command: CreatePosCommand): Pos {
    return this.service.createPos(command.merchantId, command.branchId, command.dto);
  }
}
