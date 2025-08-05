import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { Merchant } from '../core/entities/merchant.entity';
import { Branch } from '../core/entities/branch.entity';
import { Pos } from '../core/entities/pos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Merchant, Branch, Pos])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
