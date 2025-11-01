import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LeaveTypeEntity } from '../entities/leave-type.entity';
import { LeaveTypeRepository } from '@features/leave-management/domain/repositories/leave-type.repository';
import { LeaveType } from '@features/leave-management/domain/models/leave-type.model';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

@Injectable()
export class LeaveTypeRepositoryImpl
  implements LeaveTypeRepository<EntityManager>
{
  constructor(
    @InjectRepository(LeaveTypeEntity)
    private readonly repository: Repository<LeaveTypeEntity>,
  ) {}

  async create(type: LeaveType, manager: EntityManager): Promise<LeaveType> {
    const query = `
      INSERT INTO ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} (name, code, desc1, paid, remarks) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    const result = await manager.query(query, [
      type.name,
      type.code,
      type.desc1,
      type.paid,
      type.remarks,
    ]);

    const entity = result[0];
    return new LeaveType({
      id: entity.id,
      name: entity.name,
      code: entity.code,
      desc1: entity.desc1,
      paid: entity.paid,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async update(
    id: number,
    dto: Partial<LeaveType>,
    manager: EntityManager,
  ): Promise<boolean> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(dto.name);
    }
    if (dto.code !== undefined) {
      updates.push(`code = $${paramIndex++}`);
      params.push(dto.code);
    }
    if (dto.desc1 !== undefined) {
      updates.push(`desc1 = $${paramIndex++}`);
      params.push(dto.desc1);
    }
    if (dto.paid !== undefined) {
      updates.push(`paid = $${paramIndex++}`);
      params.push(dto.paid);
    }
    if (dto.remarks !== undefined) {
      updates.push(`remarks = $${paramIndex++}`);
      params.push(dto.remarks);
    }

    if (updates.length === 0) return false;

    params.push(id);
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} 
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
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);
    return result[1] > 0;
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<LeaveType | null> {
    const query = `
      SELECT id, name, code, desc1, paid, remarks, isactive 
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} 
      WHERE id = $1
    `;
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new LeaveType({
      id: entity.id,
      name: entity.name,
      code: entity.code,
      desc1: entity.desc1,
      paid: entity.paid,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: LeaveType[];
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
        'WHERE (name ILIKE $' +
        (params.length + 1) +
        ' OR code ILIKE $' +
        (params.length + 2) +
        ' OR desc1 ILIKE $' +
        (params.length + 3) +
        ')';
      params.push(`%${term}%`, `%${term}%`, `%${term}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} ${whereClause}`;
    const countResult = await this.repository.query(countQuery, params);
    const totalRecords = parseInt(countResult[0].total);

    // Get paginated data
    const limitParam = params.length + 1;
    const offsetParam = params.length + 2;
    const dataQuery = `
      SELECT id, name, code, desc1, paid, remarks, isactive 
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} 
      ${whereClause}
      ORDER BY name ASC 
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;
    params.push(limit, offset);

    const entities = await this.repository.query(dataQuery, params);

    const data = entities.map(
      (entity: any) =>
        new LeaveType({
          id: entity.id,
          name: entity.name,
          code: entity.code,
          desc1: entity.desc1,
          paid: entity.paid,
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

  async findByName(
    name: string,
    manager: EntityManager,
  ): Promise<LeaveType | null> {
    const query = `
      SELECT id, name, code, desc1, paid, remarks, isactive 
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} 
      WHERE name = $1 AND isactive = true
    `;
    const result = await manager.query(query, [name]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new LeaveType({
      id: entity.id,
      name: entity.name,
      code: entity.code,
      desc1: entity.desc1,
      paid: entity.paid,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async findByCode(
    code: string,
    manager: EntityManager,
  ): Promise<LeaveType | null> {
    const query = `
      SELECT id, name, code, desc1, paid, remarks, isactive 
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} 
      WHERE code = $1 AND isactive = true
    `;
    const result = await manager.query(query, [code]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new LeaveType({
      id: entity.id,
      name: entity.name,
      code: entity.code,
      desc1: entity.desc1,
      paid: entity.paid,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async retrieveForCombobox(): Promise<LeaveType[]> {
    const query = `
      SELECT id, name, code, desc1, paid, remarks, isactive 
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_TYPE} 
      WHERE isactive = true 
      ORDER BY name ASC
    `;
    const entities = await this.repository.query(query);

    return entities.map(
      (entity: any) =>
        new LeaveType({
          id: entity.id,
          name: entity.name,
          code: entity.code,
          desc1: entity.desc1,
          paid: entity.paid,
          remarks: entity.remarks,
          isActive: entity.isactive,
        }),
    );
  }
}
