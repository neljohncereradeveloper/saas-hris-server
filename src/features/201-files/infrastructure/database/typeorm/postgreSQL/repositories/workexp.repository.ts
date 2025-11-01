import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { WorkExpEntity } from '../entities/workexp.entity';
import { WorkExpRepository } from '@features/201-files/domain/repositories/workexp.repository';
import { WorkExp } from '@features/201-files/domain/models/workexp.model';

@Injectable()
export class WorkExpRepositoryImpl implements WorkExpRepository<EntityManager> {
  constructor(
    @InjectRepository(WorkExpEntity)
    private readonly repository: Repository<WorkExpEntity>,
  ) {}

  async create(dto: WorkExp, manager: EntityManager): Promise<WorkExp> {
    const query = `
      INSERT INTO workexp (employeeid, companyid, workexpjobtitleid, years) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, employeeid, companyid, workexpjobtitleid, years, isactive
    `;
    const result = await manager.query(query, [
      dto.employeeId,
      dto.companyId,
      dto.workexpJobTitleId,
      dto.years,
    ]);

    const entity = result[0];
    return new WorkExp({
      id: entity.id,
      employeeId: entity.employeeid,
      companyId: entity.companyid,
      workexpJobTitleId: entity.workexpjobtitleid,
      years: entity.years,
      isActive: entity.isactive,
    });
  }

  async update(
    id: number,
    dto: Partial<WorkExp>,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE workexp 
      SET companyid = $1, workexpjobtitleid = $2, years = $3
      WHERE id = $4
    `;
    const result = await manager.query(query, [
      dto.companyId,
      dto.workexpJobTitleId,
      dto.years,
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
      UPDATE workexp 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);
    return result[1] > 0; // result[1] is the rowCount
  }

  async findById(id: number, manager: EntityManager): Promise<WorkExp | null> {
    const query = `
      SELECT id, employeeid, companyid, workexpjobtitleid, years, isactive 
      FROM workexp 
      WHERE id = $1
    `;
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new WorkExp({
      id: entity.id,
      employeeId: entity.employeeid,
      companyId: entity.companyid,
      workexpJobTitleId: entity.workexpjobtitleid,
      years: entity.years,
      isActive: entity.isactive,
    });
  }

  async findEmployeesWorkExp(employeeId: number): Promise<{
    data: WorkExp[];
  }> {
    const query = `
      SELECT id, employeeid, companyid, workexpjobtitleid, years, isactive 
      FROM workexp 
      WHERE employeeid = $1 
      ORDER BY years DESC
    `;
    const entities = await this.repository.query(query, [employeeId]);

    const data = entities.map(
      (entity: any) =>
        new WorkExp({
          id: entity.id,
          employeeId: entity.employeeid,
          companyId: entity.companyid,
          workexpJobTitleId: entity.workexpjobtitleid,
          years: entity.years,
          isActive: entity.isactive,
        }),
    );

    return { data };
  }
}
