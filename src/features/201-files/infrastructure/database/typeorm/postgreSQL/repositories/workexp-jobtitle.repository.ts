import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { WorkExpJobTitleEntity } from '../entities/workexp-jobtitle.entity';
import { WorkExpJobTitleRepository } from '@features/201-files/domain/repositories/workexp-jobtitle.repository';
import { WorkExpJobTitle } from '@features/201-files/domain/models/workexp-jobtitle.model';

@Injectable()
export class WorkExpJobTitleRepositoryImpl
  implements WorkExpJobTitleRepository<EntityManager>
{
  constructor(
    @InjectRepository(WorkExpJobTitleEntity)
    private readonly repository: Repository<WorkExpJobTitleEntity>,
  ) {}

  async create(
    workexpJobtitle: WorkExpJobTitle,
    manager: EntityManager,
  ): Promise<WorkExpJobTitle> {
    const query = `
      INSERT INTO workexp_jobtitle (desc1) 
      VALUES ($1) 
      RETURNING id, desc1, isactive
    `;
    const result = await manager.query(query, [workexpJobtitle.desc1]);

    const entity = result[0];
    return new WorkExpJobTitle({
      id: entity.id,
      desc1: entity.desc1,
      isActive: entity.isactive,
    });
  }

  async update(
    id: number,
    dto: Partial<WorkExpJobTitle>,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE workexp_jobtitle 
      SET desc1 = $1
      WHERE id = $2
    `;
    const result = await manager.query(query, [dto.desc1, id]);
    return result[1] > 0; // result[1] is the rowCount
  }

  async softDelete(
    id: number,
    isActive: boolean,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE workexp_jobtitle 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);
    return result[1] > 0; // result[1] is the rowCount
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<WorkExpJobTitle | null> {
    const query =
      'SELECT id, desc1, isactive FROM workexp_jobtitle WHERE id = $1';
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new WorkExpJobTitle({
      id: entity.id,
      desc1: entity.desc1,
      isActive: entity.isactive,
    });
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: WorkExpJobTitle[];
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
      whereClause += 'WHERE desc1 ILIKE $' + (params.length + 1);
      params.push(`%${term}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM workexp_jobtitle ${whereClause}`;
    const countResult = await this.repository.query(countQuery, params);
    const totalRecords = parseInt(countResult[0].total);

    // Get paginated data
    const dataQuery = `
      SELECT id, desc1, isactive 
      FROM workexp_jobtitle 
      ${whereClause}
      ORDER BY desc1 ASC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const entities = await this.repository.query(dataQuery, params);

    const data = entities.map(
      (entity: any) =>
        new WorkExpJobTitle({
          id: entity.id,
          desc1: entity.desc1,
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
  ): Promise<WorkExpJobTitle | null> {
    const query =
      'SELECT id, desc1, isactive FROM workexp_jobtitle WHERE desc1 = $1 AND isactive = true';
    const result = await manager.query(query, [desc1]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new WorkExpJobTitle({
      id: entity.id,
      desc1: entity.desc1,
      isActive: entity.isactive,
    });
  }

  async retrieveForCombobox(): Promise<WorkExpJobTitle[]> {
    const query =
      'SELECT id, desc1, isactive FROM workexp_jobtitle WHERE isactive = true ORDER BY desc1 ASC';
    const entities = await this.repository.query(query);

    return entities.map(
      (entity: any) =>
        new WorkExpJobTitle({
          id: entity.id,
          desc1: entity.desc1,
          isActive: entity.isactive,
        }),
    );
  }
}
