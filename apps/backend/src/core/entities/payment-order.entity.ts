import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch } from './branch.entity';
import { Pos } from './pos.entity';
import { PaymentOrderStatus } from '../../shared/enums/payment-order-status.enum';

@Entity('payment_orders')
export class PaymentOrder {
  @PrimaryGeneratedColumn('uuid')
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

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deactivatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @ManyToOne(() => Branch, { nullable: false, onDelete: 'CASCADE' })
  branch: Branch;

  @ManyToOne(() => Pos, { nullable: false, onDelete: 'CASCADE' })
  pos: Pos;

  @OneToMany('Transaction', (tx: any) => tx.paymentOrder)
  transactions: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  shouldBeCancelled(): boolean {
    return this.status === PaymentOrderStatus.ACTIVE && this.isExpired();
  }

  deactivate(): void {
    this.deactivatedAt = new Date();
    if (this.status === PaymentOrderStatus.ACTIVE) {
      this.status = PaymentOrderStatus.CANCELLED;
    }
  }
}
