import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Branch } from '../branches/branch.entity';
import { Order } from '../orders/order.entity';

@Entity({ name: 'pos' })
export class Pos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  identifier: string;

  @ManyToOne(() => Branch, (branch) => branch.pos)
  branch: Branch;

  @OneToMany(() => Order, (order) => order.pos)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
