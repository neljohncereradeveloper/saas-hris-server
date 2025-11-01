import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DeptEntity } from '../entities/dept.entity';
import { DepartmentRepository } from '@features/201-files/domain/repositories/department.repository';
import { Dept } from '@features/201-files/domain/models/dept';

@Injectable()
export class DepartmentRepositoryImpl
  implements DepartmentRepository<EntityManager>
{
  constructor(
    @InjectRepository(DeptEntity)
    private readonly repository: Repository<DeptEntity>,
  ) {}

  async create(department: Dept, manager: EntityManager): Promise<Dept> {
    const query = `
      INSERT INTO dept (desc1, code, designation) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const result = await manager.query(query, [
      department.desc1,
      department.code,
      department.designation,
    ]);

    const entity = result[0];
    return new Dept({
      id: entity.id,
      desc1: entity.desc1,
      code: entity.code,
      designation: entity.designation,
      isActive: entity.isactive,
    });
  }

  async update(
    id: number,
    dto: Partial<Dept>,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE dept 
      SET desc1 = $1, code = $2, designation = $3
      WHERE id = $4
    `;
    const result = await manager.query(query, [
      dto.desc1,
      dto.code,
      dto.designation,
      id,
    ]);
    return result[1] > 0; // result[1] is the rowCount
  }

  async softDelete(
    id: number,
    isActive: boolean,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE dept 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);
    return result[1] > 0; // result[1] is the rowCount
  }

  async findById(id: number, manager: EntityManager): Promise<Dept | null> {
    const query =
      'SELECT id, desc1, code, designation, isactive FROM dept WHERE id = $1';
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new Dept({
      id: entity.id,
      desc1: entity.desc1,
      code: entity.code,
      designation: entity.designation,
      isActive: entity.isactive,
    });
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Dept[];
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
        'WHERE (desc1 ILIKE $' +
        (params.length + 1) +
        ' OR code ILIKE $' +
        (params.length + 2) +
        ' OR designation ILIKE $' +
        (params.length + 3) +
        ')';
      params.push(`%${term}%`, `%${term}%`, `%${term}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM dept ${whereClause}`;
    const countResult = await this.repository.query(countQuery, params);
    const totalRecords = parseInt(countResult[0].total);

    // Get paginated data
    const dataQuery = `
      SELECT id, desc1, code, designation, isactive 
      FROM dept 
      ${whereClause}
      ORDER BY desc1 ASC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const entities = await this.repository.query(dataQuery, params);

    const data = entities.map(
      (entity: any) =>
        new Dept({
          id: entity.id,
          desc1: entity.desc1,
          code: entity.code,
          designation: entity.designation,
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

  async findByDescription(
    desc1: string,
    manager: EntityManager,
  ): Promise<Dept | null> {
    const query =
      'SELECT id, desc1, code, designation, isactive FROM dept WHERE desc1 = $1 AND isactive = true';
    const result = await manager.query(query, [desc1]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new Dept({
      id: entity.id,
      desc1: entity.desc1,
      code: entity.code,
      designation: entity.designation,
      isActive: entity.isactive,
    });
  }

  async retrieveForCombobox(): Promise<Dept[]> {
    const query =
      'SELECT id, desc1, code, designation, isactive FROM dept WHERE isactive = true ORDER BY desc1 ASC';
    const entities = await this.repository.query(query);

    return entities.map(
      (entity: any) =>
        new Dept({
          id: entity.id,
          desc1: entity.desc1,
          code: entity.code,
          designation: entity.designation,
          isActive: entity.isactive,
        }),
    );
  }
}
