import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LeaveTransactionEntity } from '../entities/leave-transaction.entity';
import { LeaveTransactionRepository } from '@features/leave-management/domain/repositories/leave-transaction.repository';
import { LeaveTransaction } from '@features/leave-management/domain/models/leave-transaction.model';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

@Injectable()
export class LeaveTransactionRepositoryImpl
  implements LeaveTransactionRepository<EntityManager>
{
  constructor(
    @InjectRepository(LeaveTransactionEntity)
    private readonly repository: Repository<LeaveTransactionEntity>,
  ) {}

  async create(
    tx: LeaveTransaction,
    manager: EntityManager,
  ): Promise<LeaveTransaction> {
    const query = `
      INSERT INTO ${CONSTANTS_DATABASE_MODELS.LEAVE_TRANSACTION} 
        (balanceid, transactiontype, days, remarks, isactive)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await manager.query(query, [
      tx.balanceId,
      tx.transactionType,
      tx.days,
      tx.remarks || '',
      tx.isActive !== undefined ? tx.isActive : true,
    ]);

    const entity = result[0];
    return this.mapEntityToModel(entity);
  }

  async findByBalance(
    balanceId: number,
    manager: EntityManager,
  ): Promise<LeaveTransaction[]> {
    const query = `
      SELECT * FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_TRANSACTION}
      WHERE balanceid = $1 AND isactive = true
      ORDER BY createdat DESC
    `;
    const result = await manager.query(query, [balanceId]);
    return result.map((entity: any) => this.mapEntityToModel(entity));
  }

  async recordTransaction(
    balanceId: number,
    type: 'earn' | 'use' | 'carry_over' | 'encash',
    days: number,
    remarks: string,
    userId: number,
    manager: EntityManager,
  ): Promise<LeaveTransaction> {
    // Map the type to EnumLeaveTransactionType
    const typeMap: Record<string, any> = {
      earn: 'adjustment',
      use: 'request',
      carry_over: 'carry',
      encash: 'encashment',
    };

    const transactionType = typeMap[type] || 'adjustment';

    const tx = new LeaveTransaction({
      balanceId,
      transactionType: transactionType as any,
      days,
      remarks,
      isActive: true,
    });

    return this.create(tx, manager);
  }

  private mapEntityToModel(entity: any): LeaveTransaction {
    return new LeaveTransaction({
      id: entity.id,
      balanceId: entity.balanceid,
      transactionType: entity.transactiontype,
      days: parseFloat(entity.days),
      remarks: entity.remarks || '',
      isActive: entity.isactive,
    });
  }
}
