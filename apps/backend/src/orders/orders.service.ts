import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

export interface Order {
  id: number;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
}

@Injectable()
export class OrdersService {
  private orders = new Map<number, Order>();
  private currentId = 1;

  create(dto: CreateOrderDto): Order {
    const order: Order = {
      id: this.currentId++,
      amount: dto.amount,
      description: dto.description,
      status: 'pending',
    };
    this.orders.set(order.id, order);
    return order;
  }

  findOne(id: number): Order | undefined {
    return this.orders.get(id);
  }
}
