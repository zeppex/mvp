import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MerchantsService, Pos } from '../merchants.service';
import { ListPosQuery } from '../queries/list-pos.query';

@QueryHandler(ListPosQuery)
export class ListPosHandler implements IQueryHandler<ListPosQuery> {
  constructor(private readonly service: MerchantsService) {}

  execute(query: ListPosQuery): Pos[] {
    return this.service.listPos(query.merchantId, query.branchId);
  }
}
