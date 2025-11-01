import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CitizenShipEntity } from '../entities/citizenship.entity';
import { CitizenShipRepository } from '@features/201-files/domain/repositories/citizenship.repository';
import { CitizenShip } from '@features/201-files/domain/models/citizenship.model';

@Injectable()
export class CitizenShipRepositoryImpl
  implements CitizenShipRepository<EntityManager>
{
  constructor(
    @InjectRepository(CitizenShipEntity)
    private readonly repository: Repository<CitizenShipEntity>,
  ) {}

  async create(
    citizenShip: CitizenShip,
    manager: EntityManager,
  ): Promise<CitizenShip> {
    const query = `
      INSERT INTO citizenship (desc1) 
      VALUES ($1) 
      RETURNING *
    `;
    const result = await manager.query(query, [citizenShip.desc1]);

    const entity = result[0];
    return new CitizenShip({
      id: entity.id,
      desc1: entity.desc1,
      isActive: entity.isactive,
    });
  }

  async update(
    id: number,
    dto: Partial<CitizenShip>,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE citizenship 
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
      UPDATE citizenship 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);
    return result[1] > 0; // result[1] is the rowCount
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<CitizenShip | null> {
    const query = 'SELECT id, desc1, isactive FROM citizenship WHERE id = $1';
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new CitizenShip({
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
    data: CitizenShip[];
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
    const countQuery = `SELECT COUNT(*) as total FROM citizenship ${whereClause}`;
    const countResult = await this.repository.query(countQuery, params);
    const totalRecords = parseInt(countResult[0].total);

    // Get paginated data
    const dataQuery = `
      SELECT id, desc1, isactive 
      FROM citizenship 
      ${whereClause}
      ORDER BY desc1 ASC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const entities = await this.repository.query(dataQuery, params);

    const data = entities.map(
      (entity: any) =>
        new CitizenShip({
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
  ): Promise<CitizenShip | null> {
    const query =
      'SELECT id, desc1, isactive FROM citizenship WHERE desc1 = $1 AND isactive = true';
    const result = await manager.query(query, [desc1]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new CitizenShip({
      id: entity.id,
      desc1: entity.desc1,
      isActive: entity.isactive,
    });
  }

  async retrieveForCombobox(): Promise<CitizenShip[]> {
    const query =
      'SELECT id, desc1, isactive FROM citizenship WHERE isactive = true ORDER BY desc1 ASC';
    const entities = await this.repository.query(query);

    return entities.map(
      (entity: any) =>
        new CitizenShip({
          id: entity.id,
          desc1: entity.desc1,
          isActive: entity.isactive,
        }),
    );
  }
}
