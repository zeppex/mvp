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
import { PaymentOrderStatus } from '../../shared/enums/payment-order-status.enum';

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

  @ManyToOne(() => Pos, { nullable: false })
  pos: Pos;

  @OneToMany('Transaction', (tx: any) => tx.paymentOrder)
  transactions: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }
}
