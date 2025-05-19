import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.repo.create({
      amount: dto.amount,
      description: dto.description,
      status: 'pending',
    });
    return await this.repo.save(order);
  }

  async findOne(id: string): Promise<Order | null> {
    return await this.repo.findOne({ where: { id } });
  }
}
