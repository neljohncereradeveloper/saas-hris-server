import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LeaveYearConfigurationEntity } from '../entities/leave-year-configuration.entity';
import { LeaveYearConfigurationRepository } from '@features/leave-management/domain/repositories/leave-year-configuration.repository';
import { LeaveYearConfiguration } from '@features/leave-management/domain/models/leave-year-configuration.model';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

@Injectable()
export class LeaveYearConfigurationRepositoryImpl
  implements LeaveYearConfigurationRepository<EntityManager>
{
  constructor(
    @InjectRepository(LeaveYearConfigurationEntity)
    private readonly repository: Repository<LeaveYearConfigurationEntity>,
  ) {}

  async create(
    configuration: LeaveYearConfiguration,
    manager: EntityManager,
  ): Promise<LeaveYearConfiguration> {
    const query = `
      INSERT INTO ${CONSTANTS_DATABASE_MODELS.LEAVE_YEAR_CONFIGURATION} 
        (cutoffstartdate, cutoffenddate, year, remarks, isactive)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, cutoffstartdate::text as cutoffstartdate, cutoffenddate::text as cutoffenddate, 
                year, remarks, isactive
    `;
    const result = await manager.query(query, [
      configuration.cutoffStartDate,
      configuration.cutoffEndDate,
      configuration.year,
      configuration.remarks || null,
      configuration.isActive !== undefined ? configuration.isActive : true,
    ]);

    const entity = result[0];
    return new LeaveYearConfiguration({
      id: entity.id,
      cutoffStartDate: new Date(entity.cutoffstartdate),
      cutoffEndDate: new Date(entity.cutoffenddate),
      year: entity.year,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async update(
    id: number,
    configuration: Partial<LeaveYearConfiguration>,
    manager: EntityManager,
  ): Promise<LeaveYearConfiguration> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (configuration.cutoffStartDate !== undefined) {
      updates.push(`cutoffstartdate = $${paramIndex++}`);
      params.push(configuration.cutoffStartDate);
    }
    if (configuration.cutoffEndDate !== undefined) {
      updates.push(`cutoffenddate = $${paramIndex++}`);
      params.push(configuration.cutoffEndDate);
    }
    if (configuration.year !== undefined) {
      updates.push(`year = $${paramIndex++}`);
      params.push(configuration.year);
    }
    if (configuration.remarks !== undefined) {
      updates.push(`remarks = $${paramIndex++}`);
      params.push(configuration.remarks);
    }
    if (configuration.isActive !== undefined) {
      updates.push(`isactive = $${paramIndex++}`);
      params.push(configuration.isActive);
    }

    if (updates.length === 0) {
      const existing = await this.findById(id, manager);
      if (!existing) {
        throw new Error(`Leave year configuration with id ${id} not found`);
      }
      return existing;
    }

    updates.push(`updatedat = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_YEAR_CONFIGURATION}
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, cutoffstartdate::text as cutoffstartdate, cutoffenddate::text as cutoffenddate, 
                year, remarks, isactive
    `;

    const result = await manager.query(query, params);

    if (result.length === 0) {
      throw new Error(`Leave year configuration with id ${id} not found`);
    }

    const entity = result[0];
    return new LeaveYearConfiguration({
      id: entity.id,
      cutoffStartDate: new Date(entity.cutoffstartdate),
      cutoffEndDate: new Date(entity.cutoffenddate),
      year: entity.year,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<LeaveYearConfiguration | null> {
    const query = `
      SELECT id, cutoffstartdate::text as cutoffstartdate, cutoffenddate::text as cutoffenddate, 
             year, remarks, isactive
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_YEAR_CONFIGURATION}
      WHERE id = $1 AND isactive = true
    `;
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new LeaveYearConfiguration({
      id: entity.id,
      cutoffStartDate: new Date(entity.cutoffstartdate),
      cutoffEndDate: new Date(entity.cutoffenddate),
      year: entity.year,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async findByYear(
    year: string,
    manager: EntityManager,
  ): Promise<LeaveYearConfiguration | null> {
    const query = `
      SELECT id, cutoffstartdate::text as cutoffstartdate, cutoffenddate::text as cutoffenddate, 
             year, remarks, isactive
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_YEAR_CONFIGURATION}
      WHERE year = $1 AND isactive = true
    `;
    const result = await manager.query(query, [year]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new LeaveYearConfiguration({
      id: entity.id,
      cutoffStartDate: new Date(entity.cutoffstartdate),
      cutoffEndDate: new Date(entity.cutoffenddate),
      year: entity.year,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async findActiveForDate(
    date: Date,
    manager: EntityManager,
  ): Promise<LeaveYearConfiguration | null> {
    const query = `
      SELECT id, cutoffstartdate::text as cutoffstartdate, cutoffenddate::text as cutoffenddate, 
             year, remarks, isactive
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_YEAR_CONFIGURATION}
      WHERE $1::date >= cutoffstartdate 
        AND $1::date <= cutoffenddate 
        AND isactive = true
      ORDER BY cutoffstartdate DESC
      LIMIT 1
    `;
    const result = await manager.query(query, [date]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new LeaveYearConfiguration({
      id: entity.id,
      cutoffStartDate: new Date(entity.cutoffstartdate),
      cutoffEndDate: new Date(entity.cutoffenddate),
      year: entity.year,
      remarks: entity.remarks,
      isActive: entity.isactive,
    });
  }

  async findAll(manager: EntityManager): Promise<LeaveYearConfiguration[]> {
    const query = `
      SELECT id, cutoffstartdate::text as cutoffstartdate, cutoffenddate::text as cutoffenddate, 
             year, remarks, isactive
      FROM ${CONSTANTS_DATABASE_MODELS.LEAVE_YEAR_CONFIGURATION}
      WHERE isactive = true
      ORDER BY cutoffstartdate DESC
    `;
    const result = await manager.query(query);

    return result.map(
      (entity: any) =>
        new LeaveYearConfiguration({
          id: entity.id,
          cutoffStartDate: new Date(entity.cutoffstartdate),
          cutoffEndDate: new Date(entity.cutoffenddate),
          year: entity.year,
          remarks: entity.remarks,
          isActive: entity.isactive,
        }),
    );
  }

  async softDelete(
    id: number,
    isActive: boolean,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.LEAVE_YEAR_CONFIGURATION}
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await manager.query(query, [isActive, id]);
    return true;
  }
}
