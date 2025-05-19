import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MerchantsService } from '../merchants.service';
import { DeletePosCommand } from '../commands/delete-pos.command';

@CommandHandler(DeletePosCommand)
export class DeletePosHandler implements ICommandHandler<DeletePosCommand> {
  constructor(private readonly service: MerchantsService) {}

  execute(command: DeletePosCommand): void {
    this.service.deletePos(command.merchantId, command.branchId, command.posId);
  }
}
