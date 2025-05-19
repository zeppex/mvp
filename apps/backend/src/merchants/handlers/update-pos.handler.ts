import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MerchantsService, Pos } from '../merchants.service';
import { UpdatePosCommand } from '../commands/update-pos.command';

@CommandHandler(UpdatePosCommand)
export class UpdatePosHandler implements ICommandHandler<UpdatePosCommand> {
  constructor(private readonly service: MerchantsService) {}

  execute(command: UpdatePosCommand): Pos {
    return this.service.updatePos(
      command.merchantId,
      command.branchId,
      command.posId,
      command.dto,
    );
  }
}
