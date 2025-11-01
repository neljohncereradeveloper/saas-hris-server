import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HolidayEntity } from '../entities/holiday.entity';
import { HolidayRepository } from '@features/shared/domain/repositories/holiday.repository';
import { Holiday } from '@features/shared/domain/models/holiday.model';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

@Injectable()
export class HolidayRepositoryImpl implements HolidayRepository<EntityManager> {
  constructor(
    @InjectRepository(HolidayEntity)
    private readonly repository: Repository<HolidayEntity>,
  ) {}

  async create(holiday: Holiday, manager: EntityManager): Promise<Holiday> {
    const query = `
      INSERT INTO ${CONSTANTS_DATABASE_MODELS.HOLIDAY} (name, date, description) 
      VALUES ($1, $2, $3) 
      RETURNING id, name, date::text as date, description, createdat, updatedat, createdby, updatedby, isactive
    `;
    const result = await manager.query(query, [
      holiday.name,
      holiday.date,
      holiday.description,
    ]);

    const entity = result[0];

    return new Holiday({
      id: entity.id,
      name: entity.name,
      date: entity.date, // date is now a string "YYYY-MM-DD" from PostgreSQL
      description: entity.description,
      isActive: entity.isactive,
    });
  }

  async update(
    id: number,
    dto: Partial<Holiday>,
    manager: EntityManager,
  ): Promise<boolean> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(dto.name);
    }
    if (dto.date !== undefined) {
      updates.push(`date = $${paramIndex++}`);
      params.push(dto.date);
    }
    if (dto.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(dto.description);
    }

    if (updates.length === 0) return false;

    params.push(id);
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.HOLIDAY} 
      SET ${updates.join(', ')}, updatedat = CURRENT_TIMESTAMP
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
      UPDATE ${CONSTANTS_DATABASE_MODELS.HOLIDAY} 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);
    return result[1] > 0;
  }

  async findById(id: number, manager: EntityManager): Promise<Holiday | null> {
    const query = `
      SELECT id, name, date::text as date, description, isactive 
      FROM ${CONSTANTS_DATABASE_MODELS.HOLIDAY} 
      WHERE id = $1
    `;
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new Holiday({
      id: entity.id,
      name: entity.name,
      date: entity.date, // date is now a string "YYYY-MM-DD" from PostgreSQL
      description: entity.description,
      isActive: entity.isactive,
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    manager: EntityManager,
  ): Promise<Holiday[]> {
    // Format dates to YYYY-MM-DD for date comparison
    const startDateStr = this.formatDateForQuery(startDate);
    const endDateStr = this.formatDateForQuery(endDate);

    const query = `
      SELECT id, name, date::text as date, description, isactive 
      FROM ${CONSTANTS_DATABASE_MODELS.HOLIDAY} 
      WHERE date >= $1 AND date <= $2 AND isactive = true
      ORDER BY date ASC
    `;
    const result = await manager.query(query, [startDateStr, endDateStr]);

    return result.map(
      (entity: any) =>
        new Holiday({
          id: entity.id,
          name: entity.name,
          date: entity.date,
          description: entity.description,
          isActive: entity.isactive,
        }),
    );
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
    manager?: EntityManager,
  ): Promise<{
    data: Holiday[];
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
        ' OR description ILIKE $' +
        (params.length + 2) +
        ')';
      params.push(`%${term}%`, `%${term}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM ${CONSTANTS_DATABASE_MODELS.HOLIDAY} ${whereClause}`;
    const countResult = manager
      ? await manager.query(countQuery, params)
      : await this.repository.query(countQuery, params);
    const totalRecords = parseInt(countResult[0].total);

    // Get paginated data
    const limitParam = params.length + 1;
    const offsetParam = params.length + 2;
    const dataQuery = `
      SELECT id, name, date::text as date, description, isactive 
      FROM ${CONSTANTS_DATABASE_MODELS.HOLIDAY} 
      ${whereClause}
      ORDER BY date DESC 
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;
    params.push(limit, offset);

    const entities = manager
      ? await manager.query(dataQuery, params)
      : await this.repository.query(dataQuery, params);

    const data = entities.map(
      (entity: any) =>
        new Holiday({
          id: entity.id,
          name: entity.name,
          date: entity.date,
          description: entity.description,
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

  async findByYear(year: number, manager: EntityManager): Promise<Holiday[]> {
    const query = `
      SELECT id, name, date::text as date, description, isactive 
      FROM ${CONSTANTS_DATABASE_MODELS.HOLIDAY} 
      WHERE EXTRACT(YEAR FROM date) = $1 AND isactive = true
      ORDER BY date ASC
    `;
    const result = await manager.query(query, [year]);

    return result.map(
      (entity: any) =>
        new Holiday({
          id: entity.id,
          name: entity.name,
          date: entity.date,
          description: entity.description,
          isActive: entity.isactive,
        }),
    );
  }

  /**
   * Format date to YYYY-MM-DD string for SQL query
   */
  private formatDateForQuery(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
