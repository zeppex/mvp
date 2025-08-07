import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../entities/branch.entity';
import { PaymentOrder } from '../entities/payment-order.entity';
import { CreateBranchDto, UpdateBranchDto } from '../dto';
import { MerchantService } from './merchant.service';
import { AccountService } from '../../hedera/account.service';
import { TokenService } from '../../hedera/token.service';
import { AccountId } from '@hashgraph/sdk';

@Injectable()
export class BranchService {
  private readonly logger = new Logger(BranchService.name);

  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(PaymentOrder)
    private readonly paymentOrderRepository: Repository<PaymentOrder>,
    private readonly merchantService: MerchantService,
    private readonly accountService: AccountService,
    private readonly tokenService: TokenService,
  ) {}

  async create(
    merchantId: string,
    createBranchDto: CreateBranchDto,
  ): Promise<Branch> {
    // ensure merchant exists
    const merchant = await this.merchantService.findOne(merchantId);

    // Create Hedera account for the branch
    const accountInfo = await this.accountService.createBranchAccount(
      createBranchDto.name,
      0.1, // Initial HBAR balance
    );

    const branch = this.branchRepository.create({
      ...createBranchDto,
      merchantId: merchantId,
      merchant: { id: merchantId } as any,
      hederaAccountId: accountInfo.accountId,
      hederaPublicKey: accountInfo.publicKey,
      hederaPrivateKey: accountInfo.privateKey,
    });

    const savedBranch = await this.branchRepository.save(branch);

    // Note: We don't update merchant's total balances here because:
    // 1. A new branch won't have any balances yet
    // 2. This avoids cascade issues with existing branches that might have null merchantId
    // 3. Balances will be updated when actual transactions occur

    return savedBranch;
  }

  async findAll(
    merchantId: string,
    includeDeactivated: boolean = false,
  ): Promise<Branch[]> {
    const whereCondition: any = { merchantId };

    if (!includeDeactivated) {
      whereCondition.isActive = true;
    }

    const branches = await this.branchRepository.find({
      relations: ['merchant', 'pos'],
      where: whereCondition,
    });

    return branches;
  }

  async findOne(id: string, merchantId?: string): Promise<Branch> {
    const queryOptions: any = {
      where: { id },
      relations: ['merchant', 'pos'],
    };

    if (merchantId) {
      queryOptions.where.merchantId = merchantId;
    }

    const branch = await this.branchRepository.findOne(queryOptions);

    if (!branch) {
      throw new NotFoundException(`Branch ${id} not found`);
    }

    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);

    Object.assign(branch, updateBranchDto);
    return this.branchRepository.save(branch);
  }

  async remove(id: string): Promise<void> {
    const branch = await this.findOne(id);

    if (!branch.isActive) {
      throw new ForbiddenException(`Branch ${id} is already deactivated`);
    }

    // Soft delete: deactivate the branch
    branch.deactivate();
    await this.branchRepository.save(branch);

    // Cascade: deactivate all POS under this branch
    if (branch.pos && branch.pos.length > 0) {
      for (const pos of branch.pos) {
        if (pos.isActive) {
          pos.deactivate();
          await this.branchRepository.manager.save(pos);
        }
        // Cascade: deactivate all payment orders for this POS
        const paymentOrders = await this.paymentOrderRepository.find({
          where: { pos: { id: pos.id }, deactivatedAt: null },
        });
        for (const order of paymentOrders) {
          if (!order.deactivatedAt) {
            order.deactivate();
            await this.paymentOrderRepository.save(order);
          }
        }
      }
    }

    // Update merchant's total balances (only if merchant exists)
    try {
      const merchant = await this.merchantService.findOne(branch.merchant.id);
      merchant.updateTotalBalances();
      await this.merchantService.update(merchant.id, merchant);
    } catch (error) {
      this.logger.warn(
        `Could not update merchant balances after branch removal: ${error.message}`,
      );
    }
  }

  async updateBranchBalance(branchId: string): Promise<Branch> {
    const branch = await this.findOne(branchId);

    if (!branch.hederaAccountId) {
      throw new Error(`Branch ${branchId} does not have a Hedera account`);
    }

    try {
      const accountId = AccountId.fromString(branch.hederaAccountId);
      const balance = await this.accountService.getAccountBalance(accountId);

      branch.updateTokenBalance(balance.tokenBalance);
      branch.updateHbarBalance(balance.hbarBalance);

      const updatedBranch = await this.branchRepository.save(branch);

      // Update merchant's total balances
      const merchant = await this.merchantService.findOne(branch.merchant.id);
      merchant.updateTotalBalances();
      await this.merchantService.update(merchant.id, merchant);

      return updatedBranch;
    } catch (error) {
      throw new Error(`Failed to update branch balance: ${error.message}`);
    }
  }

  async mintTokensToBranch(
    branchId: string,
    amount: number,
    memo?: string,
  ): Promise<void> {
    const branch = await this.findOne(branchId);

    if (!branch.hederaAccountId) {
      throw new Error(`Branch ${branchId} does not have a Hedera account`);
    }

    try {
      const accountId = AccountId.fromString(branch.hederaAccountId);
      await this.tokenService.mintTokens(accountId, amount, memo);

      // Update the branch balance
      await this.updateBranchBalance(branchId);
    } catch (error) {
      throw new Error(`Failed to mint tokens to branch: ${error.message}`);
    }
  }

  async getMerchantBalanceSummary(merchantId: string): Promise<{
    totalZeppexTokenBalance: string;
    totalHbarBalance: string;
    branchBalances: Array<{
      branchId: string;
      branchName: string;
      zeppexTokenBalance: string;
      hbarBalance: string;
      lastBalanceUpdate: Date;
    }>;
  }> {
    const merchant = await this.merchantService.findOne(merchantId);
    const branches = await this.findAll(merchantId);

    const branchBalances = branches.map((branch) => ({
      branchId: branch.id,
      branchName: branch.name,
      zeppexTokenBalance: branch.zeppexTokenBalance,
      hbarBalance: branch.hbarBalance,
      lastBalanceUpdate: branch.lastBalanceUpdate,
    }));

    return {
      totalZeppexTokenBalance: merchant.totalZeppexTokenBalance,
      totalHbarBalance: merchant.totalHbarBalance,
      branchBalances,
    };
  }
}
