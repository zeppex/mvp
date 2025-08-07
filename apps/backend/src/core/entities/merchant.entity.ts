import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch } from './branch.entity';

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  contact: string;

  @Column()
  contactName: string;

  @Column()
  contactPhone: string;

  @Column({ nullable: true })
  binanceId: string;

  @Column({ default: true })
  isActive: boolean;

  // Token balance summary
  @Column({ type: 'decimal', precision: 18, scale: 8, default: '0' })
  totalZeppexTokenBalance: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: '0' })
  totalHbarBalance: string;

  @Column({ type: 'timestamp', nullable: true })
  lastBalanceUpdate: Date;

  @OneToMany(() => Branch, (branch) => branch.merchant, { cascade: true })
  branches: Branch[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  updateTotalBalances(): void {
    const totalTokenBalance = this.branches.reduce(
      (sum, branch) => sum + parseFloat(branch.zeppexTokenBalance || '0'),
      0,
    );
    const totalHbarBalance = this.branches.reduce(
      (sum, branch) => sum + parseFloat(branch.hbarBalance || '0'),
      0,
    );

    this.totalZeppexTokenBalance = totalTokenBalance.toString();
    this.totalHbarBalance = totalHbarBalance.toString();
    this.lastBalanceUpdate = new Date();
  }
}
