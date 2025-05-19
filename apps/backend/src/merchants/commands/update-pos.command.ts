import { UpdatePosDto } from '../dto/update-pos.dto';
export class UpdatePosCommand {
  constructor(
    public readonly merchantId: number,
    public readonly branchId: number,
    public readonly posId: number,
    public readonly dto: UpdatePosDto,
  ) {}
}
