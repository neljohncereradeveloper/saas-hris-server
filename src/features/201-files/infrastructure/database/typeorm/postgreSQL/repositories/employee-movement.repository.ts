import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { EmployeeMovementRepository } from '@features/201-files/domain/repositories/employee-movement.repository';
import { EmployeeMovement } from '@features/201-files/domain/models/employee-movement.model';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

@Injectable()
export class EmployeeMovementRepositoryImpl
  implements EmployeeMovementRepository<EntityManager>
{
  constructor(private readonly dataSource: DataSource) {}

  async create(
    movement: EmployeeMovement,
    manager: EntityManager,
  ): Promise<EmployeeMovement> {
    const insertQuery = `
      INSERT INTO ${CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT} (
        employeeid, employeeovementtypeid, effectivedate, reason,
        previousbranchid, previousdepartmentid, previousjobtitleid,
        previousannualsalary, previousmonthlysalary,
        newbranchid, newdepartmentid, newjobtitleid,
        newannualsalary, newmonthlysalary,
        approvedby, approveddate, notes, createdby, createdat, updatedat
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
      RETURNING id, employeeid, employeeovementtypeid, effectivedate::text as effectivedate, reason,
        previousbranchid, previousdepartmentid, previousjobtitleid,
        previousannualsalary, previousmonthlysalary,
        newbranchid, newdepartmentid, newjobtitleid,
        newannualsalary, newmonthlysalary,
        approvedby, approveddate::text as approveddate, notes, createdby, createdat, updatedat, isactive
    `;

    const values = [
      movement.employeeId,
      movement.employeeMovementTypeId,
      movement.effectiveDate,
      movement.reason || null,
      movement.previousBranchId || null,
      movement.previousDepartmentId || null,
      movement.previousJobTitleId || null,
      movement.previousAnnualSalary || null,
      movement.previousMonthlySalary || null,
      movement.newBranchId || null,
      movement.newDepartmentId || null,
      movement.newJobTitleId || null,
      movement.newAnnualSalary || null,
      movement.newMonthlySalary || null,
      movement.approvedBy || null,
      movement.approvedDate || null,
      movement.notes || null,
      movement.createdBy || 'system',
    ];

    const result = await manager.query(insertQuery, values);
    const createdMovement = result[0];

    return this.mapRowToModel(createdMovement);
  }

  async update(
    id: number,
    movement: Partial<EmployeeMovement>,
    manager: EntityManager,
  ): Promise<boolean> {
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (movement.employeeMovementTypeId !== undefined) {
      updateFields.push(`employeeovementtypeid = $${paramIndex++}`);
      values.push(movement.employeeMovementTypeId);
    }
    if (movement.effectiveDate !== undefined) {
      updateFields.push(`effectivedate = $${paramIndex++}`);
      values.push(movement.effectiveDate);
    }
    if (movement.reason !== undefined) {
      updateFields.push(`reason = $${paramIndex++}`);
      values.push(movement.reason);
    }
    if (movement.previousBranchId !== undefined) {
      updateFields.push(`previousbranchid = $${paramIndex++}`);
      values.push(movement.previousBranchId);
    }
    if (movement.previousDepartmentId !== undefined) {
      updateFields.push(`previousdepartmentid = $${paramIndex++}`);
      values.push(movement.previousDepartmentId);
    }
    if (movement.previousJobTitleId !== undefined) {
      updateFields.push(`previousjobtitleid = $${paramIndex++}`);
      values.push(movement.previousJobTitleId);
    }
    if (movement.previousAnnualSalary !== undefined) {
      updateFields.push(`previousannualsalary = $${paramIndex++}`);
      values.push(movement.previousAnnualSalary);
    }
    if (movement.previousMonthlySalary !== undefined) {
      updateFields.push(`previousmonthlysalary = $${paramIndex++}`);
      values.push(movement.previousMonthlySalary);
    }
    if (movement.newBranchId !== undefined) {
      updateFields.push(`newbranchid = $${paramIndex++}`);
      values.push(movement.newBranchId);
    }
    if (movement.newDepartmentId !== undefined) {
      updateFields.push(`newdepartmentid = $${paramIndex++}`);
      values.push(movement.newDepartmentId);
    }
    if (movement.newJobTitleId !== undefined) {
      updateFields.push(`newjobtitleid = $${paramIndex++}`);
      values.push(movement.newJobTitleId);
    }
    if (movement.newAnnualSalary !== undefined) {
      updateFields.push(`newannualsalary = $${paramIndex++}`);
      values.push(movement.newAnnualSalary);
    }
    if (movement.newMonthlySalary !== undefined) {
      updateFields.push(`newmonthlysalary = $${paramIndex++}`);
      values.push(movement.newMonthlySalary);
    }
    if (movement.approvedBy !== undefined) {
      updateFields.push(`approvedby = $${paramIndex++}`);
      values.push(movement.approvedBy);
    }
    if (movement.approvedDate !== undefined) {
      updateFields.push(`approveddate = $${paramIndex++}`);
      values.push(movement.approvedDate);
    }
    if (movement.notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      values.push(movement.notes);
    }
    if (movement.updatedBy !== undefined) {
      updateFields.push(`updatedby = $${paramIndex++}`);
      values.push(movement.updatedBy);
    }

    updateFields.push(`updatedat = NOW()`);
    values.push(id);

    const updateQuery = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT}
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
    `;
    const result = await manager.query(updateQuery, values);

    return result.rowCount > 0;
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<EmployeeMovement | null> {
    const query = `
      SELECT 
        m.id, m.employeeid, m.employeeovementtypeid, m.effectivedate::text as effectivedate, m.reason,
        m.previousbranchid, m.previousdepartmentid, m.previousjobtitleid,
        m.previousannualsalary, m.previousmonthlysalary,
        m.newbranchid, m.newdepartmentid, m.newjobtitleid,
        m.newannualsalary, m.newmonthlysalary,
        m.approvedby, m.approveddate::text as approveddate, m.notes, m.createdby, m.createdat, m.updatedat, m.isactive,
        emt.desc1 as movementtype employeeovementtype,
        e.fname as fname, e.lname as lname, e.mname as mname,
        pb.name as previousbranchname,
        nb.name as newbranchname,
        pd.name as previousdepartmentname,
        nd.name as newdepartmentname,
        pjt.name as previousjobtitlename,
        njt.name as newjobtitlename
      FROM ${CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT} m
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT_TYPE} emt ON m.employeeovementtypeid = emt.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.EMPLOYEE} e ON m.employeeid = e.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BRANCH} pb ON m.previousbranchid = pb.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BRANCH} nb ON m.newbranchid = nb.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.DEPARTMENT} pd ON m.previousdepartmentid = pd.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.DEPARTMENT} nd ON m.newdepartmentid = nd.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.JOBTITLE} pjt ON m.previousjobtitleid = pjt.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.JOBTITLE} njt ON m.newjobtitleid = njt.id
      WHERE m.id = $1
    `;

    const result = await manager.query(query, [id]);

    return result.length > 0 ? this.mapRowToModel(result[0]) : null;
  }

  async findByEmployeeId(
    employeeId: number,
    manager: EntityManager,
  ): Promise<EmployeeMovement[]> {
    const queryRunner = manager.queryRunner;

    const query = `
      SELECT 
        m.id, m.employeeid, m.employeeovementtypeid, m.effectivedate::text as effectivedate, m.reason,
        m.previousbranchid, m.previousdepartmentid, m.previousjobtitleid,
        m.previousannualsalary, m.previousmonthlysalary,
        m.newbranchid, m.newdepartmentid, m.newjobtitleid,
        m.newannualsalary, m.newmonthlysalary,
        m.approvedby, m.approveddate::text as approveddate, m.notes, m.createdby, m.createdat, m.updatedat, m.isactive,
        emt.desc1 as movementtype employeeovementtype,
        e.fname as fname, e.lname as lname, e.mname as mname,
        pb.name as previousbranchname,
        nb.name as newbranchname,
        pd.name as previousdepartmentname,
        nd.name as newdepartmentname,
        pjt.name as previousjobtitlename,
        njt.name as newjobtitlename
      FROM ${CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT} m
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT_TYPE} emt ON m.employeeovementtypeid = emt.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.EMPLOYEE} e ON m.employeeid = e.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BRANCH} pb ON m.previousbranchid = pb.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BRANCH} nb ON m.newbranchid = nb.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.DEPARTMENT} pd ON m.previousdepartmentid = pd.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.DEPARTMENT} nd ON m.newdepartmentid = nd.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.JOBTITLE} pjt ON m.previousjobtitleid = pjt.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.JOBTITLE} njt ON m.newjobtitleid = njt.id
      WHERE m.employeeid = $1
      ORDER BY m.effectivedate DESC
    `;

    const result = await manager.query(query, [employeeId]);

    return result.map((row: any) => this.mapRowToModel(row));
  }

  async findWithPagination(
    page: number,
    limit: number,
    manager: EntityManager,
    filters?: {
      employeeId?: number;
      movementType?: string;
      effectiveDateFrom?: Date;
      effectiveDateTo?: Date;
      searchTerm?: string;
    },
  ): Promise<{
    data: EmployeeMovement[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let whereConditions = [];
    let values = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (filters?.employeeId) {
      whereConditions.push(`m.employeeid = $${paramIndex++}`);
      values.push(filters.employeeId);
    }

    if (filters?.movementType) {
      whereConditions.push(`m.movementtype = $${paramIndex++}`);
      values.push(filters.movementType);
    }

    if (filters?.effectiveDateFrom) {
      whereConditions.push(`m.effectivedate >= $${paramIndex++}`);
      values.push(filters.effectiveDateFrom);
    }

    if (filters?.effectiveDateTo) {
      whereConditions.push(`m.effectivedate <= $${paramIndex++}`);
      values.push(filters.effectiveDateTo);
    }

    if (filters?.searchTerm) {
      whereConditions.push(
        `(e.fname ILIKE $${paramIndex} OR e.lname ILIKE $${paramIndex} OR m.reason ILIKE $${paramIndex})`,
      );
      values.push(`%${filters.searchTerm}%`);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT} m
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.EMPLOYEE} e ON m.employeeid = e.id
      ${whereClause}
    `;

    const countResult = await manager.query(countQuery, values);
    const total = parseInt(countResult[0].total);

    // Data query with pagination
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT 
        m.*,
        emt.desc1 as movementtype employeeovementtype,
        e.fname as fname, e.lname as lname, e.mname as mname,
        pb.name as previousbranchname,
        nb.name as newbranchname,
        pd.name as previousdepartmentname,
        nd.name as newdepartmentname,
        pjt.name as previousjobtitlename,
        njt.name as newjobtitlename
      FROM ${CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT} m
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.EMPLOYEE} e ON m.employeeid = e.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT_TYPE} emt ON m.employeeovementtypeid = emt.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BRANCH} pb ON m.previousbranchid = pb.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BRANCH} nb ON m.newbranchid = nb.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.DEPARTMENT} pd ON m.previousdepartmentid = pd.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.DEPARTMENT} nd ON m.newdepartmentid = nd.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.JOBTITLE} pjt ON m.previousjobtitleid = pjt.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.JOBTITLE} njt ON m.newjobtitleid = njt.id
      ${whereClause}
      ORDER BY m.effectivedate DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataValues = [...values, limit, offset];
    const dataResult = await manager.query(dataQuery, dataValues);

    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.map((row: any) => this.mapRowToModel(row)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async softDelete(
    id: number,
    isActive: boolean,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT} 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);
    return result[1] > 0; // result[1] is the rowCount
  }

  private mapRowToModel(row: any): EmployeeMovement {
    const movement = new EmployeeMovement(
      row.employeeid,
      row.employeeovementtypeid,
      row.effectivedate,
      {
        reason: row.reason,
        previousBranchId: row.previousbranchid,
        previousDepartmentId: row.previousdepartmentid,
        previousJobTitleId: row.previousjobtitleid,
        previousAnnualSalary: row.previousannualsalary,
        previousMonthlySalary: row.previousmonthlysalary,
        newBranchId: row.newbranchid,
        newDepartmentId: row.newdepartmentid,
        newJobTitleId: row.newjobtitleid,
        newAnnualSalary: row.newannualsalary,
        newMonthlySalary: row.newmonthlysalary,
        approvedBy: row.approvedby,
        approvedDate: row.approveddate,
        notes: row.notes,
        createdBy: row.createdby,
      },
    );

    // Set additional properties that aren't in constructor
    movement.id = row.id;
    movement.previousBranch = row.previousbranchname;
    movement.previousDepartment = row.previousdepartmentname;
    movement.previousJobTitle = row.previousjobtitlename;
    movement.newBranch = row.newbranchname;
    movement.newDepartment = row.newdepartmentname;
    movement.newJobTitle = row.newjobtitlename;
    movement.createdAt = row.createdat;
    movement.updatedAt = row.updatedat;
    movement.updatedBy = row.updatedby;

    return movement;
  }
}
