import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToOne,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Merchant } from '../merchant/merchant.entity';
import { Branch } from '../merchant/branch.entity';
import { Pos } from '../merchant/pos.entity';
import { PaymentOrder } from '../merchant/payment-order.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date: Date;

  @Column()
  status: string;

  @ManyToOne(() => Merchant, { nullable: false })
  merchant: Merchant;

  @Column('uuid')
  merchantId: string;

  @ManyToOne(() => Branch, { nullable: false })
  branch: Branch;

  @Column('uuid')
  branchId: string;

  @ManyToOne(() => Pos, { nullable: false })
  pos: Pos;

  @Column('uuid')
  posId: string;

  @ManyToOne(() => PaymentOrder, (order) => order.transactions, {
    nullable: true,
  })
  paymentOrder: PaymentOrder;

  @Column('uuid', { nullable: true })
  paymentOrderId: string;

  @Column('decimal', { precision: 18, scale: 8 })
  amount: string;

  @Column()
  exchange: string;

  @Column()
  description: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }
}
