import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToOne,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Merchant } from '../merchant/entities/merchant.entity';
import { Branch } from '../merchant/entities/branch.entity';
import { Pos } from '../merchant/entities/pos.entity';
import { PaymentOrder } from '../merchant/entities/payment-order.entity';
import { Tenant } from '../tenant/entities/tenant.entity';

//TODO agregar userID, fechas, tipado de datos
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

  @ManyToOne(() => Branch, { nullable: false })
  branch: Branch;

  @ManyToOne(() => Pos, { nullable: false })
  pos: Pos;

  @ManyToOne(() => PaymentOrder, (order) => order.transactions, {
    nullable: true,
  })
  paymentOrder: PaymentOrder;

  @Column('decimal', { precision: 18, scale: 8 })
  amount: string;

  @Column()
  exchange: string;

  @Column()
  description: string;

  @ManyToOne(() => Tenant, { nullable: false })
  tenant: Tenant;

  @Column('uuid', { nullable: true })
  userId: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}
