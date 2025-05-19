import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MerchantsService } from './merchants.service';
import { MerchantsController } from './merchants.controller';
import { CreateMerchantHandler } from './handlers/create-merchant.handler';
import { CreateBranchHandler } from './handlers/create-branch.handler';
import { CreatePosHandler } from './handlers/create-pos.handler';
import { UpdatePosHandler } from './handlers/update-pos.handler';
import { DeletePosHandler } from './handlers/delete-pos.handler';
import { GetPosHandler } from './handlers/get-pos.handler';
import { ListPosHandler } from './handlers/list-pos.handler';

const handlers = [
  CreateMerchantHandler,
  CreateBranchHandler,
  CreatePosHandler,
  UpdatePosHandler,
  DeletePosHandler,
  GetPosHandler,
  ListPosHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [MerchantsController],
  providers: [MerchantsService, ...handlers],
})
export class MerchantsModule {}
