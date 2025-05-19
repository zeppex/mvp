export class GetPosQuery {
  constructor(
    public readonly merchantId: number,
    public readonly branchId: number,
    public readonly posId: number,
  ) {}
}
