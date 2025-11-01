import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BranchEntity } from '../entities/branch.entity';
import { BranchRepository } from '@features/201-files/domain/repositories/branch.repository';
import { Branch } from '@features/201-files/domain/models/branch.model';

@Injectable()
export class BranchRepositoryImpl implements BranchRepository<EntityManager> {
  constructor(
    @InjectRepository(BranchEntity)
    private readonly repository: Repository<BranchEntity>,
  ) {}

  async create(branch: Branch, manager: EntityManager): Promise<Branch> {
    const query = `
      INSERT INTO branch (desc1, brcode) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    const result = await manager.query(query, [branch.desc1, branch.brCode]);

    const entity = result[0];
    return new Branch({
      id: entity.id,
      desc1: entity.desc1,
      brCode: entity.brcode,
      isActive: entity.isactive,
    });
  }

  async update(
    id: number,
    dto: Partial<Branch>,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE branch 
      SET desc1 = $1, brcode = $2
      WHERE id = $3
    `;
    const result = await manager.query(query, [dto.desc1, dto.brCode, id]);
    return result[1] > 0; // result[1] is the rowCount
  }

  async softDelete(
    id: number,
    isActive: boolean,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE branch 
        SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);
    return result[1] > 0; // result[1] is the rowCount
  }

  async findById(id: number, manager: EntityManager): Promise<Branch | null> {
    const query =
      'SELECT id, desc1, brcode, isactive FROM branch WHERE id = $1';
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new Branch({
      id: entity.id,
      desc1: entity.desc1,
      brCode: entity.brcode,
      isActive: entity.isactive,
    });
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Branch[];
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
        ' OR brcode ILIKE $' +
        (params.length + 2) +
        ')';
      params.push(`%${term}%`, `%${term}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM branch ${whereClause}`;
    const countResult = await this.repository.query(countQuery, params);
    const totalRecords = parseInt(countResult[0].total);

    // Get paginated data
    const dataQuery = `
      SELECT id, desc1, brcode, isactive 
      FROM branch 
      ${whereClause}
      ORDER BY desc1 ASC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const entities = await this.repository.query(dataQuery, params);

    const data = entities.map(
      (entity: any) =>
        new Branch({
          id: entity.id,
          desc1: entity.desc1,
          brCode: entity.brcode,
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
  ): Promise<Branch | null> {
    const query =
      'SELECT id, desc1, brcode, isactive FROM branch WHERE desc1 = $1 AND isactive = true';
    const result = await manager.query(query, [desc1]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new Branch({
      id: entity.id,
      desc1: entity.desc1,
      brCode: entity.brcode,
      isActive: entity.isactive,
    });
  }

  async findByBrCode(
    brCode: string,
    manager: EntityManager,
  ): Promise<Branch | null> {
    const query =
      'SELECT id, desc1, brcode, isactive FROM branch WHERE brcode = $1 AND isactive = true';
    const result = await manager.query(query, [brCode]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new Branch({
      id: entity.id,
      desc1: entity.desc1,
      brCode: entity.brcode,
      isActive: entity.isactive,
    });
  }

  async retrieveForCombobox(): Promise<Branch[]> {
    const query =
      'SELECT id, desc1, brcode, isactive FROM branch WHERE isactive = true ORDER BY desc1 ASC';
    const entities = await this.repository.query(query);

    return entities.map(
      (entity: any) =>
        new Branch({
          id: entity.id,
          desc1: entity.desc1,
          brCode: entity.brcode,
          isActive: entity.isactive,
        }),
    );
  }
}
