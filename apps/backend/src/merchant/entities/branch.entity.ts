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
import { Merchant } from './merchant.entity';
import { Pos } from './pos.entity';

@Entity('branches')
export class Branch {
  @PrimaryColumn('uuid')
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

  @ManyToOne(() => Merchant, (merchant) => merchant.branches, {
    onDelete: 'CASCADE',
  })
  merchant: Merchant;

  @OneToMany(() => Pos, (pos) => pos.branch)
  pos: Pos[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }

  deactivate(): void {
    this.isActive = false;
    this.deactivatedAt = new Date();
    this.originalName = this.name;
    this.name = `${this.name}-DEACTIVATED`;
  }
}
