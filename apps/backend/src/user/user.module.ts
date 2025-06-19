import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { Merchant } from '../merchant/entities/merchant.entity';
import { Branch } from '../merchant/entities/branch.entity';
import { Pos } from '../merchant/entities/pos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Merchant, Branch, Pos])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
