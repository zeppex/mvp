import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch } from './branch.entity';
import { Pos } from './pos.entity';
import { PaymentOrderStatus } from '../../shared/enums/payment-order-status.enum';

export enum ExchangeType {
  BINANCE = 'binance',
  COINBASE = 'coinbase',
  KRAKEN = 'kraken',
  // Add more exchanges as needed
}

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

  @Column({
    type: 'enum',
    enum: ExchangeType,
    default: ExchangeType.BINANCE,
  })
  exchange: ExchangeType;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  externalTransactionId: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deactivatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column('uuid')
  branchId: string;

  @Column('uuid')
  posId: string;

  @ManyToOne(() => Branch, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @ManyToOne(() => Pos, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'posId' })
  pos: Pos;

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
