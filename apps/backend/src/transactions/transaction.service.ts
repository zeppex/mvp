import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionStatus,
  ExchangeType,
} from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { User } from '../user/entities/user.entity';
import { PaymentOrder } from '../core/entities/payment-order.entity';
import { Merchant } from '../core/entities/merchant.entity';
import { Branch } from '../core/entities/branch.entity';
import { Pos } from '../core/entities/pos.entity';
import { MerchantService } from '../core/services/merchant.service';
import { BranchService } from '../core/services/branch.service';
import { PosService } from '../core/services/pos.service';
import { UUID } from '../shared/types/uuid';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly merchantService: MerchantService,
    private readonly branchService: BranchService,
    private readonly posService: PosService,
  ) {}

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const { merchantId, branchId, posId, ...rest } = dto;

    try {
      // Verify the merchant exists
      const merchant = await this.merchantService.findOne(merchantId);

      // Verify the branch exists and belongs to the merchant
      await this.branchService.findOne(branchId, merchantId);

      // Verify the POS exists and belongs to the branch
      await this.posService.findOne(merchantId, branchId, posId);

      const transaction = this.transactionRepository.create({
        ...rest,
        merchantId,
        branchId,
        posId,
        status: TransactionStatus.PENDING,
        exchange: ExchangeType.BINANCE, // Default to Binance
        date: new Date(),
      });

      const savedTransaction =
        await this.transactionRepository.save(transaction);

      this.logger.log(`Transaction created: ${savedTransaction.id}`);
      return savedTransaction;
    } catch (error) {
      this.logger.error(
        `Failed to create transaction: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async createCompleted(dto: CreateTransactionDto): Promise<Transaction> {
    const { merchantId, branchId, posId, ...rest } = dto;

    try {
      // Verify the merchant exists
      const merchant = await this.merchantService.findOne(merchantId);

      // Verify the branch exists and belongs to the merchant
      await this.branchService.findOne(branchId, merchantId);

      // Verify the POS exists and belongs to the branch
      await this.posService.findOne(merchantId, branchId, posId);

      const transaction = this.transactionRepository.create({
        ...rest,
        merchantId,
        branchId,
        posId,
        status: TransactionStatus.COMPLETED,
        exchange: ExchangeType.BINANCE, // Default to Binance
        date: new Date(),
      });

      const savedTransaction =
        await this.transactionRepository.save(transaction);

      // Mint Zeppex tokens to the branch for completed transaction
      try {
        const tokenAmount = this.calculateTokenAmount(savedTransaction.amount);
        await this.branchService.mintTokensToBranch(
          savedTransaction.branchId,
          tokenAmount,
          `Transaction completion for ${savedTransaction.id}`,
        );

        this.logger.log(
          `Minted ${tokenAmount} ZEPPEX tokens to branch ${savedTransaction.branchId} for transaction ${savedTransaction.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to mint tokens for transaction ${savedTransaction.id}: ${error.message}`,
        );
        // Don't fail the transaction creation if token minting fails
      }

      this.logger.log(`Completed transaction created: ${savedTransaction.id}`);
      return savedTransaction;
    } catch (error) {
      this.logger.error(
        `Failed to create completed transaction: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(merchantId?: UUID): Promise<Transaction[]> {
    try {
      // If a merchantId is provided, only return transactions for that merchant
      if (merchantId) {
        return this.transactionRepository.find({
          where: { merchantId },
          relations: ['merchant', 'branch', 'pos', 'paymentOrder', 'user'],
          order: { date: 'DESC' },
        });
      }

      // Otherwise return all transactions (superadmin access)
      return this.transactionRepository.find({
        relations: ['merchant', 'branch', 'pos', 'paymentOrder', 'user'],
        order: { date: 'DESC' },
      });
    } catch (error) {
      this.logger.error(
        `Failed to retrieve transactions: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: UUID, merchantId?: UUID): Promise<Transaction> {
    try {
      // Create the where condition based on whether merchantId is provided
      const where = merchantId ? { id, merchantId } : { id };

      const transaction = await this.transactionRepository.findOne({
        where,
        relations: ['merchant', 'branch', 'pos', 'paymentOrder', 'user'],
      });

      if (!transaction) {
        throw new NotFoundException(`Transaction ${id} not found`);
      }

      return transaction;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to retrieve transaction ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateStatus(
    id: UUID,
    status: TransactionStatus,
    merchantId?: UUID,
  ): Promise<Transaction> {
    try {
      const transaction = await this.findOne(id, merchantId);
      const previousStatus = transaction.status;

      transaction.status = status;
      const updatedTransaction =
        await this.transactionRepository.save(transaction);

      // If transaction is being completed, mint Zeppex tokens to the branch
      if (
        status === TransactionStatus.COMPLETED &&
        previousStatus !== TransactionStatus.COMPLETED
      ) {
        try {
          const tokenAmount = this.calculateTokenAmount(transaction.amount);
          await this.branchService.mintTokensToBranch(
            transaction.branchId,
            tokenAmount,
            `Transaction completion for ${transaction.id}`,
          );

          this.logger.log(
            `Minted ${tokenAmount} ZEPPEX tokens to branch ${transaction.branchId} for transaction ${transaction.id}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to mint tokens for transaction ${transaction.id}: ${error.message}`,
          );
          // Don't fail the transaction completion if token minting fails
        }
      }

      this.logger.log(`Transaction ${id} status updated to: ${status}`);
      return updatedTransaction;
    } catch (error) {
      this.logger.error(
        `Failed to update transaction ${id} status: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Helper: calculate token amount based on transaction amount
  private calculateTokenAmount(transactionAmount: string): number {
    // Convert transaction amount to tokens with 6 decimals
    // 1 dollar = 1,000,000 token units (6 decimals)
    const amountInDollars = parseFloat(transactionAmount);
    return Math.floor(amountInDollars * 1000000); // 1:1 ratio with 6 decimals
  }

  async completeMultipleTransactions(
    transactionIds: UUID[],
    merchantId?: UUID,
  ): Promise<Transaction[]> {
    const completedTransactions: Transaction[] = [];

    for (const transactionId of transactionIds) {
      try {
        const completedTransaction = await this.updateStatus(
          transactionId,
          TransactionStatus.COMPLETED,
          merchantId,
        );
        completedTransactions.push(completedTransaction);
      } catch (error) {
        this.logger.error(
          `Failed to complete transaction ${transactionId}: ${error.message}`,
        );
        // Continue with other transactions even if one fails
      }
    }

    this.logger.log(
      `Completed ${completedTransactions.length} out of ${transactionIds.length} transactions`,
    );
    return completedTransactions;
  }

  async remove(id: UUID, merchantId?: UUID): Promise<void> {
    try {
      // If merchantId is provided, verify the transaction belongs to that merchant
      if (merchantId) {
        const transaction = await this.findOne(id, merchantId);
        if (transaction.merchantId !== merchantId) {
          throw new ForbiddenException(
            'You do not have access to this transaction',
          );
        }
      }

      const transaction = await this.findOne(id, merchantId);

      // Cancel the transaction instead of deleting it
      transaction.status = TransactionStatus.CANCELLED;
      await this.transactionRepository.save(transaction);

      this.logger.log(`Transaction ${id} cancelled successfully`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to cancel transaction ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByPaymentOrder(paymentOrderId: UUID): Promise<Transaction[]> {
    try {
      return this.transactionRepository.find({
        where: { paymentOrderId },
        relations: ['merchant', 'branch', 'pos', 'paymentOrder', 'user'],
        order: { date: 'DESC' },
      });
    } catch (error) {
      this.logger.error(
        `Failed to retrieve transactions for payment order ${paymentOrderId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getTransactionStats(merchantId?: UUID): Promise<{
    total: number;
    pending: number;
    completed: number;
    failed: number;
    totalAmount: string;
  }> {
    try {
      const where = merchantId ? { merchantId } : {};

      const [total, pending, completed, failed] = await Promise.all([
        this.transactionRepository.count({ where }),
        this.transactionRepository.count({
          where: { ...where, status: TransactionStatus.PENDING },
        }),
        this.transactionRepository.count({
          where: { ...where, status: TransactionStatus.COMPLETED },
        }),
        this.transactionRepository.count({
          where: { ...where, status: TransactionStatus.FAILED },
        }),
      ]);

      const result = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(CAST(transaction.amount AS DECIMAL))', 'totalAmount')
        .where(merchantId ? 'transaction.merchantId = :merchantId' : '1=1', {
          merchantId,
        })
        .getRawOne();

      return {
        total,
        pending,
        completed,
        failed,
        totalAmount: result?.totalAmount || '0',
      };
    } catch (error) {
      this.logger.error(
        `Failed to get transaction stats: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
