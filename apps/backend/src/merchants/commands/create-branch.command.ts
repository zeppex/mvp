import { CreateBranchDto } from '../dto/create-branch.dto';
export class CreateBranchCommand {
  constructor(public readonly merchantId: number, public readonly dto: CreateBranchDto) {}
}
