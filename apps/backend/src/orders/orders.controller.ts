import { Body, Controller, Get, Param, Post, NotFoundException } from '@nestjs/common';
import { OrdersService, Order } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto): Order {
    return this.ordersService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Order {
    const order = this.ordersService.findOne(Number(id));
    if (!order) {
      throw new NotFoundException();
    }
    return order;
  }
}
