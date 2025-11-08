import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LeaveBalanceEntity } from '../entities/leave-balance.entity';
import { LeaveBalanceRepository } from '@features/leave-management/domain/repositories/leave-balance.repository';
import { LeaveBalance } from '@features/leave-management/domain/models/leave-balance.model';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { formatDate } from '@features/shared/infrastructure/utils/date.util';

@Injectable()
export class LeaveBalanceRepositoryImpl
  implements LeaveBalanceRepository<EntityManager>
{
  constructor(
    @InjectRepository(LeaveBalanceEntity)
    private readonly repository: Repository<LeaveBalanceEntity>,
  ) {}

  async create(
    balance: LeaveBalance,
    manager: EntityManager,
  ): Promise<LeaveBalance> {
    const query = `
      INSERT INTO ${CONSTANTS_DATABASE_MODELS.LEAVE_BALANCE} 
        (employeeid, leavetypeid, policyid, year, beginningbalance, earned, used, carriedover, encashed, remaining, lasttransactiondate, status, remarks)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, employeeid, leavetypeid, policyid, year, beginningbalance, earned, used, carriedover, encashed, remaining, 
                lasttransactiondate::text as lasttransactiondate, status, remarks, isactive
    `;
    const lastTransactionDate = balance.lastTransactionDate
      ? formatDate(balance.lastTransactionDate)
      : null;
    const result = await manager.query(query, [
      balance.employeeId,
      balance.leaveTypeId,
      balance.policyId,
      balance.year,
      balance.beginningBalance,
      balance.earned,
      balance.used,
      balance.carriedOver,
      balance.encashed,
      balance.remaining,
      lastTransactionDate,
      balance.status,
      balance.remarks,
    ]);

    const entity = result[0];
    return new LeaveBalance({
      id: entity.id,
      employeeId: entity.employeeid,
      leaveTypeId: entity.leavetypeid,
      policyId: entity.policyid,
      year: entity.year,
      beginningBalance: parseFloat(entity.beginningbalance),
      earned: parseFloat(entity.earned),
      used: parseFloat(entity.used),
      carriedOver: parseFloat(entity.carriedover),
      encashed: parseFloat(entity.encashed),
      remaining: parseFloat(entity.remaining),
      lastTransactionDate: entity.lasttransactiondate,
      status: entity.status,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async update(
    id: number,
    dto: Partial<LeaveBalance>,
    manager: EntityManager,
  ): Promise<boolean> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.beginningBalance !== undefined) {
      updates.push(`beginningbalance = $${paramIndex++}`);
      params.push(dto.beginningBalance);
    }
    if (dto.earned !== undefined) {
      updates.push(`earned = $${paramIndex++}`);
      params.push(dto.earned);
    }
    if (dto.used !== undefined) {
      updates.push(`used = $${paramIndex++}`);
      params.push(dto.used);
    }
    if (dto.carriedOver !== undefined) {
      updates.push(`carriedover = $${paramIndex++}`);
      params.push(dto.carriedOver);
    }
    if (dto.encashed !== undefined) {
      updates.push(`encashed = $${paramIndex++}`);
      params.push(dto.encashed);
    }
    if (dto.remaining !== undefined) {
      updates.push(`remaining = $${paramIndex++}`);
      params.push(dto.remaining);
    }
    if (dto.lastTransactionDate !== undefined) {
      updates.push(`lasttransactiondate = $${paramIndex++}`);
      params.push(
        dto.lastTransactionDate ? formatDate(dto.lastTransactionDate) : null,
      );
    }
    if (dto.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(dto.status);
    }
    if (dto.remarks !== undefined) {
      updates.push(`remarks = $${paramIndex++}`);
      params.push(dto.remarks);
    }

    if (updates.length === 0) return false;

    params.push(id);
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_BALANCE} 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `;
    const result = await manager.query(query, params);
    return result[1] > 0;
  }

  async softDelete(
    id: number,
    isActive: boolean,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_BALANCE} 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);
    return result[1] > 0;
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<LeaveBalance | null> {
    const query = `
      SELECT lb.id, lb.employeeid, lb.leavetypeid, lb.policyid, lb.year, 
             lb.beginningbalance, lb.earned, lb.used, lb.carriedover, lb.encashed, lb.remaining, 
             lb.lasttransactiondate::text as lasttransactiondate, lb.status, lb.remarks, lb.isactive,
             lt.name as leavetype
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_BALANCE} lb
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} lt ON lb.leavetypeid = lt.id
      WHERE lb.id = $1
    `;
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new LeaveBalance({
      id: entity.id,
      employeeId: entity.employeeid,
      leaveTypeId: entity.leavetypeid,
      leaveType: entity.leavetype,
      policyId: entity.policyid,
      year: entity.year,
      beginningBalance: parseFloat(entity.beginningbalance),
      earned: parseFloat(entity.earned),
      used: parseFloat(entity.used),
      carriedOver: parseFloat(entity.carriedover),
      encashed: parseFloat(entity.encashed),
      remaining: parseFloat(entity.remaining),
      lastTransactionDate: entity.lasttransactiondate,
      status: entity.status,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async findByEmployeeYear(
    employeeId: number,
    year: string,
  ): Promise<LeaveBalance[]> {
    const query = `
      SELECT lb.id, lb.employeeid, lb.leavetypeid, lb.policyid, lb.year, 
             lb.beginningbalance, lb.earned, lb.used, lb.carriedover, lb.encashed, lb.remaining, 
             lb.lasttransactiondate::text as lasttransactiondate, lb.status, lb.remarks, lb.isactive,
             lt.name as leavetype
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_BALANCE} lb
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} lt ON lb.leavetypeid = lt.id
      WHERE lb.employeeid = $1 AND lb.year = $2 AND lb.isactive = true
      ORDER BY leavetype
    `;
    const result = await this.repository.query(query, [employeeId, year]);

    return result.map(
      (entity: any) =>
        new LeaveBalance({
          id: entity.id,
          employeeId: entity.employeeid,
          leaveTypeId: entity.leavetypeid,
          leaveType: entity.leavetype,
          policyId: entity.policyid,
          year: entity.year,
          beginningBalance: parseFloat(entity.beginningbalance),
          earned: parseFloat(entity.earned),
          used: parseFloat(entity.used),
          carriedOver: parseFloat(entity.carriedover),
          encashed: parseFloat(entity.encashed),
          remaining: parseFloat(entity.remaining),
          lastTransactionDate: entity.lasttransactiondate,
          status: entity.status,
          remarks: entity.remarks,
          isActive: entity.isactive,
        }),
    );
  }

  async findByLeaveType(
    employeeId: number,
    leaveTypeId: number,
    year: string,
    manager: EntityManager,
  ): Promise<LeaveBalance | null> {
    const query = `
      SELECT lb.id, lb.employeeid, lb.leavetypeid, lb.policyid, lb.year, 
             lb.beginningbalance, lb.earned, lb.used, lb.carriedover, lb.encashed, lb.remaining, 
             lb.lasttransactiondate::text as lasttransactiondate, lb.status, lb.remarks, lb.isactive,
             lt.name as leavetype
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_BALANCE} lb
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} lt ON lb.leavetypeid = lt.id
      WHERE lb.employeeid = $1 AND lb.leavetypeid = $2 AND lb.year = $3 AND lb.isactive = true
    `;
    const result = await manager.query(query, [employeeId, leaveTypeId, year]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new LeaveBalance({
      id: entity.id,
      employeeId: entity.employeeid,
      leaveTypeId: entity.leavetypeid,
      leaveType: entity.leavetype,
      policyId: entity.policyid,
      year: entity.year,
      beginningBalance: parseFloat(entity.beginningbalance),
      earned: parseFloat(entity.earned),
      used: parseFloat(entity.used),
      carriedOver: parseFloat(entity.carriedover),
      encashed: parseFloat(entity.encashed),
      remaining: parseFloat(entity.remaining),
      lastTransactionDate: entity.lasttransactiondate,
      status: entity.status,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async closeBalance(id: number, manager: EntityManager): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_BALANCE} 
      SET status = 'closed', updatedat = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    const result = await manager.query(query, [id]);
    return result[1] > 0;
  }

  async resetBalancesForYear(
    year: string,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_BALANCE} 
      SET earned = 0, used = 0, encashed = 0, remaining = beginningbalance + carriedover, 
          updatedat = CURRENT_TIMESTAMP 
      WHERE year = $1 AND isactive = true
    `;
    const result = await manager.query(query, [year]);
    return result[1] > 0;
  }
}
