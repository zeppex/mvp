import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { CreatePosDto } from './dto/create-pos.dto';
import { UpdatePosDto } from './dto/update-pos.dto';

export interface Pos {
  id: number;
  name: string;
}

export interface Branch {
  id: number;
  name: string;
  pos: Map<number, Pos>;
}

export interface Merchant {
  id: number;
  name: string;
  branches: Map<number, Branch>;
}

@Injectable()
export class MerchantsService {
  private merchants = new Map<number, Merchant>();
  private currentMerchantId = 1;
  private currentBranchId = 1;
  private currentPosId = 1;

  createMerchant(dto: CreateMerchantDto): Merchant {
    const merchant: Merchant = {
      id: this.currentMerchantId++,
      name: dto.name,
      branches: new Map(),
    };
    this.merchants.set(merchant.id, merchant);
    return merchant;
  }

  getMerchant(id: number): Merchant {
    const merchant = this.merchants.get(id);
    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  createBranch(merchantId: number, dto: CreateBranchDto): Branch {
    const merchant = this.getMerchant(merchantId);
    const branch: Branch = {
      id: this.currentBranchId++,
      name: dto.name,
      pos: new Map(),
    };
    merchant.branches.set(branch.id, branch);
    return branch;
  }

  getBranch(merchantId: number, branchId: number): Branch {
    const merchant = this.getMerchant(merchantId);
    const branch = merchant.branches.get(branchId);
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  createPos(merchantId: number, branchId: number, dto: CreatePosDto): Pos {
    const branch = this.getBranch(merchantId, branchId);
    const pos: Pos = {
      id: this.currentPosId++,
      name: dto.name,
    };
    branch.pos.set(pos.id, pos);
    return pos;
  }

  updatePos(merchantId: number, branchId: number, posId: number, dto: UpdatePosDto): Pos {
    const branch = this.getBranch(merchantId, branchId);
    const pos = branch.pos.get(posId);
    if (!pos) throw new NotFoundException('PoS not found');
    if (dto.name !== undefined) pos.name = dto.name;
    return pos;
  }

  deletePos(merchantId: number, branchId: number, posId: number): void {
    const branch = this.getBranch(merchantId, branchId);
    if (!branch.pos.delete(posId)) {
      throw new NotFoundException('PoS not found');
    }
  }

  listPos(merchantId: number, branchId: number): Pos[] {
    const branch = this.getBranch(merchantId, branchId);
    return Array.from(branch.pos.values());
  }

  getPos(merchantId: number, branchId: number, posId: number): Pos {
    const branch = this.getBranch(merchantId, branchId);
    const pos = branch.pos.get(posId);
    if (!pos) throw new NotFoundException('PoS not found');
    return pos;
  }
}
