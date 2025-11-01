import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LeaveRequestEntity } from '../entities/leave-request.entity';
import { LeaveRequestRepository } from '@features/leave-management/domain/repositories/leave-request.repository';
import { LeaveRequest } from '@features/leave-management/domain/models/leave-request.model';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { formatDate } from '@features/shared/infrastructure/utils/date.util';

@Injectable()
export class LeaveRequestRepositoryImpl
  implements LeaveRequestRepository<EntityManager>
{
  constructor(
    @InjectRepository(LeaveRequestEntity)
    private readonly repository: Repository<LeaveRequestEntity>,
  ) {}

  async create(
    request: LeaveRequest,
    manager: EntityManager,
  ): Promise<LeaveRequest> {
    // For PENDING requests, approvalDate and approvalBy should be null
    const approvalDate =
      request.status === 'pending' ? null : request.approvalDate;
    const approvalBy =
      request.status === 'pending' ? null : request.approvalBy || null;

    const query = `
      INSERT INTO ${CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST} 
        (employeeid, leavetypeid, startdate, enddate, totaldays, reason, balanceid, approvaldate, approvalby, remarks, status, isactive)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, employeeid, leavetypeid, startdate::text as startdate, enddate::text as enddate, totaldays, reason, balanceid, 
                approvaldate::text as approvaldate, approvalby, remarks, status, isactive
    `;
    const startDateStr = formatDate(request.startDate);
    const endDateStr = formatDate(request.endDate);
    const approvalDateStr = approvalDate ? formatDate(approvalDate) : null;
    const result = await manager.query(query, [
      request.employeeId,
      request.leaveTypeId,
      startDateStr,
      endDateStr,
      request.totalDays,
      request.reason || '',
      request.balanceId,
      approvalDateStr,
      approvalBy,
      request.remarks || '',
      request.status,
      request.isActive !== undefined ? request.isActive : true,
    ]);

    const createdRequest = result[0];

    return new LeaveRequest({
      id: createdRequest.id,
      employeeId: createdRequest.employeeid,
      leaveTypeId: createdRequest.leavetypeid,
      startDate: createdRequest.startdate,
      endDate: createdRequest.enddate,
      totalDays: createdRequest.totaldays,
      reason: createdRequest.reason || '',
      status: createdRequest.status,
      balanceId: createdRequest.balanceid,
      approvalDate: createdRequest.approvaldate,
      approvalBy: createdRequest.approvalby || 0,
      remarks: createdRequest.remarks || '',
      isActive: createdRequest.isactive,
    });
  }

  async update(
    id: number,
    dto: Partial<LeaveRequest>,
    manager?: EntityManager,
  ): Promise<boolean> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.startDate !== undefined) {
      updates.push(`startdate = $${paramIndex++}`);
      params.push(formatDate(dto.startDate));
    }
    if (dto.endDate !== undefined) {
      updates.push(`enddate = $${paramIndex++}`);
      params.push(formatDate(dto.endDate));
    }
    if (dto.totalDays !== undefined) {
      updates.push(`totaldays = $${paramIndex++}`);
      params.push(dto.totalDays);
    }
    if (dto.reason !== undefined) {
      updates.push(`reason = $${paramIndex++}`);
      params.push(dto.reason);
    }
    if (dto.remarks !== undefined) {
      updates.push(`remarks = $${paramIndex++}`);
      params.push(dto.remarks);
    }
    if (dto.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(dto.status);
    }
    if (dto.leaveTypeId !== undefined) {
      updates.push(`leavetypeid = $${paramIndex++}`);
      params.push(dto.leaveTypeId);
    }
    if (dto.balanceId !== undefined) {
      updates.push(`balanceid = $${paramIndex++}`);
      params.push(dto.balanceId);
    }

    if (updates.length === 0) return false;

    updates.push(`updatedat = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST} 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `;

    const context = manager || this.repository.manager;
    const result = await context.query(query, params);
    return result[1] > 0;
  }

  async softDelete(
    id: number,
    isActive: boolean,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST} 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);
    return result[1] > 0;
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<LeaveRequest | null> {
    const query = `
      SELECT 
        lr.id, lr.employeeid, lr.leavetypeid, lr.startdate::text as startdate, lr.enddate::text as enddate, 
        lr.totaldays, lr.reason, lr.balanceid, lr.approvaldate::text as approvaldate, lr.approvalby, 
        lr.remarks, lr.status, lr.isactive,
        lt.name as leavetype
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST} lr
      INNER JOIN ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} lt ON lr.leavetypeid = lt.id
      WHERE lr.id = $1
    `;
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;
    return this.mapEntityToModel(result[0]);
  }

  async findByEmployee(
    employeeId: number,
    manager: EntityManager,
  ): Promise<LeaveRequest[]> {
    const query = `
      SELECT 
        lr.id, lr.employeeid, lr.leavetypeid, lr.startdate::text as startdate, lr.enddate::text as enddate, 
        lr.totaldays, lr.reason, lr.balanceid, lr.approvaldate::text as approvaldate, lr.approvalby, 
        lr.remarks, lr.status, lr.isactive,
        lt.name as leavetype
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST} lr
      INNER JOIN ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} lt ON lr.leavetypeid = lt.id
      WHERE lr.employeeid = $1 AND lr.isactive = true
      ORDER BY lr.startdate DESC
    `;
    const result = await manager.query(query, [employeeId]);
    return result.map((entity: any) => this.mapEntityToModel(entity));
  }

  async findPending(manager: EntityManager): Promise<LeaveRequest[]> {
    const query = `
      SELECT 
        lr.id, lr.employeeid, lr.leavetypeid, lr.startdate::text as startdate, lr.enddate::text as enddate, 
        lr.totaldays, lr.reason, lr.balanceid, lr.approvaldate::text as approvaldate, lr.approvalby, 
        lr.remarks, lr.status, lr.isactive,
        lt.name as leavetype
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST} lr
      INNER JOIN ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} lt ON lr.leavetypeid = lt.id
      WHERE lr.status = 'pending' AND lr.isactive = true
      ORDER BY lr.startdate ASC
    `;
    const result = await manager.query(query);
    return result.map((entity: any) => this.mapEntityToModel(entity));
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
    manager?: EntityManager,
  ): Promise<{
    data: LeaveRequest[];
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
    const searchTerm = term ? `%${term}%` : '%';

    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST} lr
      INNER JOIN ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} lt ON lr.leavetypeid = lt.id
      WHERE lr.isactive = true
        AND (
          lt.name ILIKE $1 OR
          lr.reason ILIKE $1 OR
          CAST(lr.employeeid AS TEXT) ILIKE $1
        )
    `;

    const dataQuery = `
      SELECT 
        lr.id, lr.employeeid, lr.leavetypeid, lr.startdate::text as startdate, lr.enddate::text as enddate, 
        lr.totaldays, lr.reason, lr.balanceid, lr.approvaldate::text as approvaldate, lr.approvalby, 
        lr.remarks, lr.status, lr.isactive,
        lt.name as leavetype
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST} lr
      INNER JOIN ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} lt ON lr.leavetypeid = lt.id
      WHERE lr.isactive = true
        AND (
          lt.name ILIKE $1 OR
          lr.reason ILIKE $1 OR
          CAST(lr.employeeid AS TEXT) ILIKE $1
        )
      ORDER BY lr.startdate DESC
      LIMIT $2 OFFSET $3
    `;

    const context = manager || this.repository.manager;
    const [countResult, dataResult] = await Promise.all([
      context.query(countQuery, [searchTerm]),
      context.query(dataQuery, [searchTerm, limit, offset]),
    ]);

    const totalRecords = parseInt(countResult[0].total);
    const totalPages = Math.ceil(totalRecords / limit);

    return {
      data: dataResult.map((entity: any) => this.mapEntityToModel(entity)),
      meta: {
        page,
        limit,
        totalRecords,
        totalPages,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
      },
    };
  }

  async updateStatus(
    id: number,
    status: string,
    approverId: number,
    remarks: string,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST} 
      SET status = $1, approvaldate = CURRENT_TIMESTAMP, approvalby = $2, remarks = $3, updatedat = CURRENT_TIMESTAMP
      WHERE id = $4
    `;
    const result = await manager.query(query, [
      status,
      approverId,
      remarks,
      id,
    ]);
    return result[1] > 0;
  }

  async findOverlappingRequests(
    employeeId: number,
    startDate: Date,
    endDate: Date,
    excludeId?: number,
    manager?: EntityManager,
  ): Promise<LeaveRequest[]> {
    // Two date ranges overlap if: newStartDate <= existingEndDate AND existingStartDate <= newEndDate
    const excludeClause = excludeId ? 'AND lr.id != $4' : '';

    const query = `
      SELECT 
        lr.id, lr.employeeid, lr.leavetypeid, lr.startdate::text as startdate, lr.enddate::text as enddate, 
        lr.totaldays, lr.reason, lr.balanceid, lr.approvaldate::text as approvaldate, lr.approvalby, 
        lr.remarks, lr.status, lr.isactive,
        lt.name as leavetype
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST} lr
      INNER JOIN ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} lt ON lr.leavetypeid = lt.id
      WHERE lr.employeeid = $1 
        AND lr.isactive = true
        AND lr.status IN ('pending', 'approved')
        AND lr.startdate <= $3 
        AND lr.enddate >= $2
        ${excludeClause}
      ORDER BY lr.startdate ASC
    `;

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    const params = excludeId
      ? [employeeId, startDateStr, endDateStr, excludeId]
      : [employeeId, startDateStr, endDateStr];

    const context = manager || this.repository.manager;
    const result = await context.query(query, params);
    return result.map((entity: any) => this.mapEntityToModel(entity));
  }

  private mapEntityToModel(entity: any): LeaveRequest {
    return new LeaveRequest({
      id: entity.id,
      employeeId: entity.employeeid,
      leaveTypeId: entity.leavetypeid,
      leaveType: entity.leavetype,
      startDate: entity.startdate,
      endDate: entity.enddate,
      totalDays: parseFloat(entity.totaldays),
      reason: entity.reason || '',
      balanceId: entity.balanceid,
      approvalDate: entity.approvaldate,
      approvalBy: entity.approvalby || 0,
      remarks: entity.remarks || '',
      status: entity.status,
      isActive: entity.isactive,
    });
  }
}
