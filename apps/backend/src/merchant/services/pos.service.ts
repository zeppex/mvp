import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pos } from '../entities/pos.entity';
import { CreatePosDto } from '../dto';
import { BranchService } from './branch.service';
import { UUID } from 'src/shared/types/uuid';

@Injectable()
export class PosService {
  constructor(
    @InjectRepository(Pos)
    private readonly posRepository: Repository<Pos>,
    private readonly branchService: BranchService,
  ) {}

  async create(
    merchantId: UUID,
    branchId: UUID,
    createPosDto: CreatePosDto,
  ): Promise<Pos> {
    // ensure branch exists under merchant
    await this.branchService.findOne(merchantId, branchId);
    const pos = this.posRepository.create({
      ...createPosDto,
      branchId,
    });
    return this.posRepository.save(pos);
  }

  async findAll(
    merchantId: UUID,
    branchId: UUID,
  ): Promise<Pos[]> {
    // ensure branch exists
    await this.branchService.findOne(merchantId, branchId);
    return this.posRepository.find({ where: { branchId } });
  }

  async findOne(
    merchantId: UUID,
    branchId: UUID,
    id: UUID,
  ): Promise<Pos> {
    await this.branchService.findOne(merchantId, branchId);
    const pos = await this.posRepository.findOne({ where: { id, branchId } });
    if (!pos)
      throw new NotFoundException(
        `POS ${id} not found for branch ${branchId}`,
      );
    return pos;
  }

  async remove(
    merchantId: UUID,
    branchId: UUID,
    id: UUID,
  ): Promise<void> {
    await this.branchService.findOne(merchantId, branchId);
    const result = await this.posRepository.delete({ id, branchId });
    if (result.affected === 0)
      throw new NotFoundException(
        `POS ${id} not found for branch ${branchId}`,
      );
  }
}
