import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LeaveCycleEntity } from '../entities/leave-cycle.entity';
import { LeaveCycleRepository } from '@features/leave-management/domain/repositories/leave-cycle.repository';
import { LeaveCycle } from '@features/leave-management/domain/models/leave-cycle.model';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

@Injectable()
export class LeaveCycleRepositoryImpl
  implements LeaveCycleRepository<EntityManager>
{
  constructor(
    @InjectRepository(LeaveCycleEntity)
    private readonly repository: Repository<LeaveCycleEntity>,
  ) {}

  async create(cycle: LeaveCycle, manager: EntityManager): Promise<LeaveCycle> {
    const query = `
      INSERT INTO ${CONSTANTS_DATABASE_MODELS.LEAVE_CYCLE} 
        (employeeid, leavetypeid, cyclestartyear, cycleendyear, totalcarried, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await manager.query(query, [
      cycle.employeeId,
      cycle.leaveTypeId,
      cycle.cycleStartYear,
      cycle.cycleEndYear,
      cycle.totalCarried,
      cycle.status,
    ]);

    const entity = result[0];
    return this.mapEntityToModelWithJoin(entity.id, manager);
  }

  async update(
    id: number,
    dto: Partial<LeaveCycle>,
    manager?: EntityManager,
  ): Promise<boolean> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.cycleStartYear !== undefined) {
      updates.push(`cyclestartyear = $${paramIndex++}`);
      params.push(dto.cycleStartYear);
    }
    if (dto.cycleEndYear !== undefined) {
      updates.push(`cycleendyear = $${paramIndex++}`);
      params.push(dto.cycleEndYear);
    }
    if (dto.totalCarried !== undefined) {
      updates.push(`totalcarried = $${paramIndex++}`);
      params.push(dto.totalCarried);
    }
    if (dto.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(dto.status);
    }

    if (updates.length === 0) return false;

    params.push(id);
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_CYCLE} 
      SET ${updates.join(', ')}, updatedat = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
    `;

    const context = manager || this.repository.manager;
    const result = await context.query(query, params);
    return result[1] > 0;
  }

  async findByEmployee(
    employeeId: number,
    manager: EntityManager,
  ): Promise<LeaveCycle[]> {
    const query = `
      SELECT lc.id, lc.employeeid, lc.leavetypeid, 
             lc.cyclestartyear, lc.cycleendyear, lc.totalcarried, lc.status, lc.isactive,
             lt.name as leavetype
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_CYCLE} lc
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} lt ON lc.leavetypeid = lt.id
      WHERE lc.employeeid = $1 AND lc.isactive = true
      ORDER BY lc.cyclestartyear DESC
    `;
    const result = await manager.query(query, [employeeId]);

    return result.map((entity: any) => this.mapEntityToModel(entity));
  }

  async getActiveCycle(
    employeeId: number,
    leaveTypeId: number,
    manager: EntityManager,
  ): Promise<LeaveCycle | null> {
    const query = `
      SELECT lc.id, lc.employeeid, lc.leavetypeid, 
             lc.cyclestartyear, lc.cycleendyear, lc.totalcarried, lc.status, lc.isactive,
             lt.name as leavetype
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_CYCLE} lc
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} lt ON lc.leavetypeid = lt.id
      WHERE lc.employeeid = $1 AND lc.leavetypeid = $2 
        AND lc.status = 'active' AND lc.isactive = true
      ORDER BY lc.cyclestartyear DESC
      LIMIT 1
    `;
    const result = await manager.query(query, [employeeId, leaveTypeId]);

    if (result.length === 0) return null;

    return this.mapEntityToModel(result[0]);
  }

  async findOverlappingCycle(
    employeeId: number,
    leaveTypeId: number,
    cycleStartYear: number,
    cycleEndYear: number,
    manager: EntityManager,
  ): Promise<LeaveCycle | null> {
    // Check for overlapping cycles: two cycles overlap if
    // cycleStartYear <= existingCycleEndYear AND existingCycleStartYear <= cycleEndYear
    const query = `
      SELECT lc.id, lc.employeeid, lc.leavetypeid, 
             lc.cyclestartyear, lc.cycleendyear, lc.totalcarried, lc.status, lc.isactive,
             lt.name as leavetype
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_CYCLE} lc
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} lt ON lc.leavetypeid = lt.id
      WHERE lc.employeeid = $1 
        AND lc.leavetypeid = $2 
        AND lc.isactive = true
        AND lc.cyclestartyear <= $4 
        AND lc.cycleendyear >= $3
      ORDER BY lc.cyclestartyear DESC
      LIMIT 1
    `;
    const result = await manager.query(query, [
      employeeId,
      leaveTypeId,
      cycleStartYear,
      cycleEndYear,
    ]);

    if (result.length === 0) return null;

    return this.mapEntityToModel(result[0]);
  }

  async closeCycle(id: number, manager: EntityManager): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_CYCLE} 
      SET status = 'completed', updatedat = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    const result = await manager.query(query, [id]);
    return result[1] > 0;
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<LeaveCycle | null> {
    const query = `
      SELECT lc.id, lc.employeeid, lc.leavetypeid, 
             lc.cyclestartyear, lc.cycleendyear, lc.totalcarried, lc.status, lc.isactive,
             lt.name as leavetype
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_CYCLE} lc
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} lt ON lc.leavetypeid = lt.id
      WHERE lc.id = $1
    `;
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    return this.mapEntityToModel(result[0]);
  }

  private async mapEntityToModelWithJoin(
    id: number,
    manager: EntityManager,
  ): Promise<LeaveCycle> {
    return this.findById(id, manager) as Promise<LeaveCycle>;
  }

  private mapEntityToModel(entity: any): LeaveCycle {
    return new LeaveCycle({
      id: entity.id,
      employeeId: entity.employeeid,
      leaveTypeId: entity.leavetypeid,
      leaveType: entity.leavetype || '',
      cycleStartYear: entity.cyclestartyear,
      cycleEndYear: entity.cycleendyear,
      totalCarried: parseFloat(entity.totalcarried || 0),
      status: entity.status,
      isActive: entity.isactive,
    });
  }
}
