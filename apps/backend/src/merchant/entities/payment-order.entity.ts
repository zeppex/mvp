import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Branch } from './branch.entity';
import { Pos } from './pos.entity';
import { Transaction } from 'src/transactions/transaction.entity';
import { PaymentOrderStatus } from 'src/shared/enums/payment-order-status.enum';

@Entity('payment_orders')
export class PaymentOrder {
  @PrimaryColumn('uuid')
  id: string;

  @Column('decimal', { precision: 18, scale: 8 })
  amount: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: PaymentOrderStatus,
    default: PaymentOrderStatus.ACTIVE,
  })
  status: PaymentOrderStatus;

  @ManyToOne(() => Branch, { nullable: false })
  branch: Branch;

  @Column('uuid')
  branchId: string;

  @ManyToOne(() => Pos, { nullable: false })
  pos: Pos;

  @Column('uuid')
  posId: string;

  @OneToMany(() => Transaction, (tx) => tx.paymentOrder)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }
}
