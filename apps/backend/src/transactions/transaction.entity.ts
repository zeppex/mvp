import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Merchant } from '../core/entities/merchant.entity';
import { Branch } from '../core/entities/branch.entity';
import { Pos } from '../core/entities/pos.entity';

import { User } from '../user/entities/user.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum ExchangeType {
  BINANCE = 'binance',
  COINBASE = 'coinbase',
  KRAKEN = 'kraken',
  // Add more exchanges as needed
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date: Date;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @ManyToOne(() => Merchant, { nullable: false })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Column('uuid')
  merchantId: string;

  @ManyToOne(() => Branch, { nullable: false })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column('uuid')
  branchId: string;

  @ManyToOne(() => Pos, { nullable: false })
  @JoinColumn({ name: 'posId' })
  pos: Pos;

  @Column('uuid')
  posId: string;

  @ManyToOne('PaymentOrder', (order: any) => order.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'paymentOrderId' })
  paymentOrder: any;

  @Column('uuid', { nullable: true })
  paymentOrderId: string;

  @Column('decimal', { precision: 18, scale: 8 })
  amount: string;

  @Column({
    type: 'enum',
    enum: ExchangeType,
    default: ExchangeType.BINANCE,
  })
  exchange: ExchangeType;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid', { nullable: true })
  userId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  externalTransactionId: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
