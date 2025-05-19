import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { CreatePosDto } from './dto/create-pos.dto';
import { UpdatePosDto } from './dto/update-pos.dto';
import { CreateMerchantCommand } from './commands/create-merchant.command';
import { CreateBranchCommand } from './commands/create-branch.command';
import { CreatePosCommand } from './commands/create-pos.command';
import { UpdatePosCommand } from './commands/update-pos.command';
import { DeletePosCommand } from './commands/delete-pos.command';
import { GetPosQuery } from './queries/get-pos.query';
import { ListPosQuery } from './queries/list-pos.query';
import { Merchant, Branch, Pos } from './merchants.service';

@Controller('merchants')
export class MerchantsController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Post()
  createMerchant(@Body() dto: CreateMerchantDto): Promise<Merchant> {
    return this.commandBus.execute(new CreateMerchantCommand(dto));
  }

  @Post(':merchantId/branches')
  createBranch(
    @Param('merchantId') merchantId: string,
    @Body() dto: CreateBranchDto,
  ): Promise<Branch> {
    return this.commandBus.execute(
      new CreateBranchCommand(Number(merchantId), dto),
    );
  }

  @Post(':merchantId/branches/:branchId/pos')
  createPos(
    @Param('merchantId') merchantId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreatePosDto,
  ): Promise<Pos> {
    return this.commandBus.execute(
      new CreatePosCommand(Number(merchantId), Number(branchId), dto),
    );
  }

  @Get(':merchantId/branches/:branchId/pos')
  listPos(
    @Param('merchantId') merchantId: string,
    @Param('branchId') branchId: string,
  ): Promise<Pos[]> {
    return this.queryBus.execute(
      new ListPosQuery(Number(merchantId), Number(branchId)),
    );
  }

  @Get(':merchantId/branches/:branchId/pos/:posId')
  getPos(
    @Param('merchantId') merchantId: string,
    @Param('branchId') branchId: string,
    @Param('posId') posId: string,
  ): Promise<Pos> {
    return this.queryBus.execute(
      new GetPosQuery(Number(merchantId), Number(branchId), Number(posId)),
    );
  }

  @Put(':merchantId/branches/:branchId/pos/:posId')
  updatePos(
    @Param('merchantId') merchantId: string,
    @Param('branchId') branchId: string,
    @Param('posId') posId: string,
    @Body() dto: UpdatePosDto,
  ): Promise<Pos> {
    return this.commandBus.execute(
      new UpdatePosCommand(
        Number(merchantId),
        Number(branchId),
        Number(posId),
        dto,
      ),
    );
  }

  @Delete(':merchantId/branches/:branchId/pos/:posId')
  deletePos(
    @Param('merchantId') merchantId: string,
    @Param('branchId') branchId: string,
    @Param('posId') posId: string,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeletePosCommand(Number(merchantId), Number(branchId), Number(posId)),
    );
  }
}
