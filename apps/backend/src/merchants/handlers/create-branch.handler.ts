import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MerchantsService, Branch } from '../merchants.service';
import { CreateBranchCommand } from '../commands/create-branch.command';

@CommandHandler(CreateBranchCommand)
export class CreateBranchHandler implements ICommandHandler<CreateBranchCommand> {
  constructor(private readonly service: MerchantsService) {}

  execute(command: CreateBranchCommand): Branch {
    return this.service.createBranch(command.merchantId, command.dto);
  }
}
