import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MerchantsService, Pos } from '../merchants.service';
import { GetPosQuery } from '../queries/get-pos.query';

@QueryHandler(GetPosQuery)
export class GetPosHandler implements IQueryHandler<GetPosQuery> {
  constructor(private readonly service: MerchantsService) {}

  execute(query: GetPosQuery): Pos {
    return this.service.getPos(query.merchantId, query.branchId, query.posId);
  }
}
