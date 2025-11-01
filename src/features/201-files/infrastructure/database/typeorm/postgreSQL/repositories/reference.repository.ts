import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ReferenceEntity } from '../entities/reference.entity';
import { ReferenceRepository } from '@features/201-files/domain/repositories/reference.repository';
import { Reference } from '@features/201-files/domain/models/reference.model';

@Injectable()
export class ReferenceRepositoryImpl
  implements ReferenceRepository<EntityManager>
{
  constructor(
    @InjectRepository(ReferenceEntity)
    private readonly repository: Repository<ReferenceEntity>,
  ) {}

  async create(
    reference: Reference,
    manager: EntityManager,
  ): Promise<Reference> {
    const query = `
      INSERT INTO reference (employeeid, fname, mname, lname, suffix, cellphonenumber) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, employeeid, fname, mname, lname, suffix, cellphonenumber, isactive
    `;
    const result = await manager.query(query, [
      reference.employeeId,
      reference.fname,
      reference.mname,
      reference.lname,
      reference.suffix,
      reference.cellphoneNumber,
    ]);

    const entity = result[0];
    return new Reference({
      id: entity.id,
      employeeId: entity.employeeid,
      fname: entity.fname,
      mname: entity.mname,
      lname: entity.lname,
      suffix: entity.suffix,
      cellphoneNumber: entity.cellphonenumber,
      isActive: entity.isactive,
    });
  }

  async update(
    id: number,
    dto: Partial<Reference>,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE reference 
      SET fname = $1, mname = $2, lname = $3, suffix = $4, cellphonenumber = $5
      WHERE id = $6
    `;
    const result = await manager.query(query, [
      dto.fname,
      dto.mname,
      dto.lname,
      dto.suffix,
      dto.cellphoneNumber,
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
      UPDATE reference 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);
    return result[1] > 0; // result[1] is the rowCount
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<Reference | null> {
    const query = `
      SELECT id, employeeid, fname, mname, lname, suffix, cellphonenumber, isactive 
      FROM reference 
      WHERE id = $1
    `;
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new Reference({
      id: entity.id,
      employeeId: entity.employeeid,
      fname: entity.fname,
      mname: entity.mname,
      lname: entity.lname,
      suffix: entity.suffix,
      cellphoneNumber: entity.cellphonenumber,
      isActive: entity.isactive,
    });
  }

  async findEmployeesReference(employeeId: number): Promise<{
    data: Reference[];
  }> {
    const query = `
      SELECT id, employeeid, fname, mname, lname, suffix, cellphonenumber, isactive 
      FROM reference 
      WHERE employeeid = $1
      ORDER BY fname ASC, lname ASC
    `;
    const entities = await this.repository.query(query, [employeeId]);

    const data = entities.map(
      (entity: any) =>
        new Reference({
          id: entity.id,
          employeeId: entity.employeeid,
          fname: entity.fname,
          mname: entity.mname,
          lname: entity.lname,
          suffix: entity.suffix,
          cellphoneNumber: entity.cellphonenumber,
          isActive: entity.isactive,
        }),
    );

    return { data };
  }
}
