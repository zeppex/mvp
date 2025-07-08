import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pos } from '../entities/pos.entity';
import { CreatePosDto, UpdatePosDto } from '../dto';
import { BranchService } from './branch.service';
import { UUID } from 'src/shared/types/uuid';

@Injectable()
export class PosService {
  private readonly logger = new Logger(PosService.name);
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
    await this.branchService.findOne(branchId, merchantId);
    const pos = this.posRepository.create({
      ...createPosDto,
      branch: { id: branchId } as any,
    });
    return this.posRepository.save(pos);
  }

  async findAll(merchantId: UUID, branchId: UUID): Promise<Pos[]> {
    // ensure branch exists
    try {
      await this.branchService.findOne(branchId, merchantId);
      return this.posRepository.find({
        where: {
          branch: { id: branchId },
        },
        relations: ['branch'],
      });
    } catch (error) {
      this.logger.error(
        `Error fetching POS for merchant ${merchantId}, branch ${branchId}: ${error.message}`,
        error.stack,
      );
      throw new NotFoundException(
        `Branch ${branchId} not found for merchant ${merchantId}`,
      );
    }
  }

  async findOne(merchantId: UUID, branchId: UUID, id: UUID): Promise<Pos> {
    await this.branchService.findOne(branchId, merchantId);
    const pos = await this.posRepository.findOne({
      where: {
        id,
        branch: { id: branchId },
      },
      relations: ['branch'],
    });
    if (!pos)
      throw new NotFoundException(`POS ${id} not found for branch ${branchId}`);
    return pos;
  }

  async update(
    merchantId: UUID,
    branchId: UUID,
    id: UUID,
    updatePosDto: UpdatePosDto,
  ): Promise<Pos> {
    await this.branchService.findOne(branchId, merchantId);
    const pos = await this.findOne(merchantId, branchId, id);

    Object.assign(pos, updatePosDto);
    return this.posRepository.save(pos);
  }

  async remove(merchantId: UUID, branchId: UUID, id: UUID): Promise<void> {
    await this.branchService.findOne(branchId, merchantId);
    const result = await this.posRepository.delete({
      id,
      branch: { id: branchId },
    });
    if (result.affected === 0)
      throw new NotFoundException(`POS ${id} not found for branch ${branchId}`);
  }
}
