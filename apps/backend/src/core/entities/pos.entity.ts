import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Branch } from './branch.entity';

@Entity('pos')
export class Pos {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  originalName: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  paymentLink: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deactivatedAt: Date;

  @Column('uuid')
  branchId: string;

  @ManyToOne(() => Branch, (branch) => branch.pos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  deactivate(): void {
    this.isActive = false;
    this.deactivatedAt = new Date();
    this.originalName = this.name;
    this.name = `${this.name}-DEACTIVATED`;
  }
}
