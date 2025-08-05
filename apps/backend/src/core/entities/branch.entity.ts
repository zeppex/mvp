import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Merchant } from './merchant.entity';
import { Pos } from './pos.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  originalName: string;

  @Column()
  address: string;

  @Column()
  contactName: string;

  @Column()
  contactPhone: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deactivatedAt: Date;

  // Hedera account information
  @Column({ nullable: true })
  hederaAccountId: string;

  @Column({ nullable: true })
  hederaPublicKey: string;

  @Column({ nullable: true })
  hederaPrivateKey: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: '0' })
  zeppexTokenBalance: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: '0' })
  hbarBalance: string;

  @Column({ type: 'timestamp', nullable: true })
  lastBalanceUpdate: Date;

  @ManyToOne(() => Merchant, (merchant) => merchant.branches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @OneToMany(() => Pos, (pos) => pos.branch)
  pos: Pos[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  deactivate(): void {
    this.isActive = false;
    this.deactivatedAt = new Date();
    this.originalName = this.name;
    this.name = `${this.name}-DEACTIVATED`;
  }

  updateTokenBalance(balance: number): void {
    this.zeppexTokenBalance = balance.toString();
    this.lastBalanceUpdate = new Date();
  }

  updateHbarBalance(balance: string): void {
    this.hbarBalance = balance;
    this.lastBalanceUpdate = new Date();
  }
}
