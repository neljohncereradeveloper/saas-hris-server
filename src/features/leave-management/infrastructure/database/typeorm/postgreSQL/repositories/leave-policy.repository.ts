import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LeavePolicyEntity } from '../entities/leave-policy.entity';
import { LeavePolicyRepository } from '@features/leave-management/domain/repositories/leave-policy.repository';
import { LeavePolicy } from '@features/leave-management/domain/models/leave-policy.model';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

@Injectable()
export class LeavePolicyRepositoryImpl
  implements LeavePolicyRepository<EntityManager>
{
  constructor(
    @InjectRepository(LeavePolicyEntity)
    private readonly repository: Repository<LeavePolicyEntity>,
  ) {}

  async create(
    policy: LeavePolicy,
    manager: EntityManager,
  ): Promise<LeavePolicy> {
    const query = `
      INSERT INTO ${CONSTANTS_DATABASE_MODELS.LEAVE_POLICY} 
        (leavetypeid, leavetype, annualentitlement, carrylimit, encashlimit, 
         cyclelengthyears, effectivedate, expirydate, status, remarks)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, leavetypeid, leavetype, annualentitlement, carrylimit, encashlimit, 
                cyclelengthyears, effectivedate::text as effectivedate, expirydate::text as expirydate, 
                status, remarks, isactive
    `;
    const result = await manager.query(query, [
      policy.leaveTypeId,
      policy.leaveType,
      policy.annualEntitlement,
      policy.carryLimit,
      policy.encashLimit,
      policy.cycleLengthYears,
      policy.effectiveDate,
      policy.expiryDate,
      policy.status,
      policy.remarks,
    ]);

    const entity = result[0];
    return new LeavePolicy({
      id: entity.id,
      leaveTypeId: entity.leavetypeid,
      leaveType: entity.leavetype,
      annualEntitlement: parseFloat(entity.annualentitlement),
      carryLimit: parseFloat(entity.carrylimit),
      encashLimit: parseFloat(entity.encashlimit),
      cycleLengthYears: entity.cyclelengthyears,
      effectiveDate: entity.effectivedate,
      expiryDate: entity.expirydate,
      status: entity.status,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async update(
    id: number,
    dto: Partial<LeavePolicy>,
    manager: EntityManager,
  ): Promise<boolean> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.annualEntitlement !== undefined) {
      updates.push(`annualentitlement = $${paramIndex++}`);
      params.push(dto.annualEntitlement);
    }
    if (dto.carryLimit !== undefined) {
      updates.push(`carrylimit = $${paramIndex++}`);
      params.push(dto.carryLimit);
    }
    if (dto.encashLimit !== undefined) {
      updates.push(`encashlimit = $${paramIndex++}`);
      params.push(dto.encashLimit);
    }
    if (dto.cycleLengthYears !== undefined) {
      updates.push(`cyclelengthyears = $${paramIndex++}`);
      params.push(dto.cycleLengthYears);
    }
    if (dto.effectiveDate !== undefined) {
      updates.push(`effectivedate = $${paramIndex++}`);
      params.push(dto.effectiveDate);
    }
    if (dto.expiryDate !== undefined) {
      updates.push(`expirydate = $${paramIndex++}`);
      params.push(dto.expiryDate);
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
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_POLICY} 
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
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_POLICY} 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);
    return result[1] > 0;
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<LeavePolicy | null> {
    const query = `
      SELECT id, leavetypeid, leavetype, annualentitlement, carrylimit, encashlimit, 
             cyclelengthyears, effectivedate::text as effectivedate, expirydate::text as expirydate, 
             status, remarks, isactive
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_POLICY} 
      WHERE id = $1
    `;
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new LeavePolicy({
      id: entity.id,
      leaveTypeId: entity.leavetypeid,
      leaveType: entity.leavetype,
      annualEntitlement: parseFloat(entity.annualentitlement),
      carryLimit: parseFloat(entity.carrylimit),
      encashLimit: parseFloat(entity.encashlimit),
      cycleLengthYears: entity.cyclelengthyears,
      effectiveDate: entity.effectivedate,
      expiryDate: entity.expirydate,
      status: entity.status,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: LeavePolicy[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];

    if (term) {
      whereClause +=
        'WHERE (leavetype ILIKE $' +
        (params.length + 1) +
        ' OR status ILIKE $' +
        (params.length + 2) +
        ')';
      params.push(`%${term}%`, `%${term}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_POLICY} ${whereClause}`;
    const countResult = await this.repository.query(countQuery, params);
    const totalRecords = parseInt(countResult[0].total);

    // Get paginated data
    const limitParam = params.length + 1;
    const offsetParam = params.length + 2;
    const dataQuery = `
      SELECT id, leavetypeid, leavetype, annualentitlement, carrylimit, encashlimit, 
             cyclelengthyears, effectivedate::text as effectivedate, expirydate::text as expirydate, 
             status, remarks, isactive
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_POLICY} 
      ${whereClause}
      ORDER BY leavetype ASC, effectivedate DESC 
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;
    params.push(limit, offset);

    const entities = await this.repository.query(dataQuery, params);

    const data = entities.map(
      (entity: any) =>
        new LeavePolicy({
          id: entity.id,
          leaveTypeId: entity.leavetypeid,
          leaveType: entity.leavetype,
          annualEntitlement: parseFloat(entity.annualentitlement),
          carryLimit: parseFloat(entity.carrylimit),
          encashLimit: parseFloat(entity.encashlimit),
          cycleLengthYears: entity.cyclelengthyears,
          effectiveDate: entity.effectivedate,
          expiryDate: entity.expirydate,
          status: entity.status,
          remarks: entity.remarks,
          isActive: entity.isactive,
        }),
    );

    const totalPages = Math.ceil(totalRecords / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

    return {
      data,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages,
        nextPage,
        previousPage,
      },
    };
  }

  async retrieveActivePolicies(manager: EntityManager): Promise<LeavePolicy[]> {
    const query = `
      SELECT id, leavetypeid, leavetype, annualentitlement, carrylimit, encashlimit, 
             cyclelengthyears, effectivedate::text as effectivedate, expirydate::text as expirydate, 
             status, remarks, isactive
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_POLICY} 
      WHERE status = 'active' AND isactive = true
      ORDER BY leavetype ASC, effectivedate DESC
    `;
    const result = await manager.query(query);

    return result.map(
      (entity: any) =>
        new LeavePolicy({
          id: entity.id,
          leaveTypeId: entity.leavetypeid,
          leaveType: entity.leavetype,
          annualEntitlement: parseFloat(entity.annualentitlement),
          carryLimit: parseFloat(entity.carrylimit),
          encashLimit: parseFloat(entity.encashlimit),
          cycleLengthYears: entity.cyclelengthyears,
          effectiveDate: entity.effectivedate,
          expiryDate: entity.expirydate,
          status: entity.status,
          remarks: entity.remarks,
          isActive: entity.isactive,
        }),
    );
  }

  async getActivePolicy(leaveTypeId: number): Promise<LeavePolicy | null> {
    const query = `
      SELECT id, leavetypeid, leavetype, annualentitlement, carrylimit, encashlimit, 
             cyclelengthyears, effectivedate::text as effectivedate, expirydate::text as expirydate, 
             status, remarks, isactive
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_POLICY} 
      WHERE leavetypeid = $1 AND status = 'active' AND isactive = true
      ORDER BY effectivedate DESC
      LIMIT 1
    `;
    const result = await this.repository.query(query, [leaveTypeId]);

    if (result.length === 0) return null;

    const entity = result[0];

    return new LeavePolicy({
      id: entity.id,
      leaveTypeId: entity.leavetypeid,
      leaveType: entity.leavetype,
      annualEntitlement: parseFloat(entity.annualentitlement),
      carryLimit: parseFloat(entity.carrylimit),
      encashLimit: parseFloat(entity.encashlimit),
      cycleLengthYears: entity.cyclelengthyears,
      effectiveDate: entity.effectivedate,
      expiryDate: entity.expirydate,
      status: entity.status,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async activatePolicy(id: number, manager: EntityManager): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_POLICY} 
      SET status = 'active', updatedat = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    const result = await manager.query(query, [id]);
    return result[1] > 0;
  }

  async retirePolicy(id: number, manager: EntityManager): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_POLICY} 
      SET status = 'retired', updatedat = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    const result = await manager.query(query, [id]);
    return result[1] > 0;
  }
}
