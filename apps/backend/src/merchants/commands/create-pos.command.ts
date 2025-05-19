import { CreatePosDto } from '../dto/create-pos.dto';
export class CreatePosCommand {
  constructor(
    public readonly merchantId: number,
    public readonly branchId: number,
    public readonly dto: CreatePosDto,
  ) {}
}
