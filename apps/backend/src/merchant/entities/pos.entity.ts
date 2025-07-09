import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
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
  qrCode: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deactivatedAt: Date;

  @ManyToOne(() => Branch, (branch) => branch.pos, { onDelete: 'CASCADE' })
  branch: Branch;

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
