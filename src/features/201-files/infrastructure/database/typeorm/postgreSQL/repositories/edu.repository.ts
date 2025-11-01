import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { EduRepository } from '@features/201-files/domain/repositories/edu';
import { Edu } from '@features/201-files/domain/models/edu';
import { EduEntity } from '../entities/edu';

@Injectable()
export class EduRepositoryImpl implements EduRepository<EntityManager> {
  constructor(
    @InjectRepository(EduEntity)
    private readonly repository: Repository<EduEntity>,
  ) {}

  async create(edu: Edu, manager: EntityManager): Promise<Edu> {
    const query = `
      INSERT INTO edu (employeeid, eduschooldid, edulevelid, educourseid, educourselevelid, schoolyear) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, employeeid, eduschooldid, edulevelid, educourseid, educourselevelid, schoolyear, isactive
    `;
    const result = await manager.query(query, [
      edu.employeeId,
      edu.eduSchoolId,
      edu.eduLevelId,
      edu.eduCourseId ?? null,
      edu.eduCourseLevelId ?? null,
      edu.schoolYear,
    ]);

    const entity = result[0];
    return new Edu({
      id: entity.id,
      employeeId: entity.employee_id,
      eduSchoolId: entity.eduschooldid,
      eduLevelId: entity.edulevelid,
      eduCourseId: entity.educourseid,
      eduCourseLevelId: entity.educourselevelid,
      schoolYear: entity.schoolyear,
      isActive: entity.isactive,
    });
  }

  async update(
    id: number,
    dto: Partial<Edu>,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE edu 
      SET employeeid = $1, eduschooldid = $2, edulevelid = $3, educourseid = $4, educourselevelid = $5, schoolyear = $6
      WHERE id = $7
    `;
    const result = await manager.query(query, [
      dto.employeeId,
      dto.eduSchoolId,
      dto.eduLevelId,
      dto.eduCourseId,
      dto.eduCourseLevelId,
      dto.schoolYear,
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
      UPDATE edu 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);
    return result[1] > 0; // result[1] is the rowCount
  }

  async findById(id: number, manager: EntityManager): Promise<Edu | null> {
    const query = `
      SELECT id, employeeid, eduschooldid, edulevelid, educourseid, educourselevelid, schoolyear, isactive 
      FROM edu 
      WHERE id = $1
    `;
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new Edu({
      id: entity.id,
      employeeId: entity.employeeid,
      eduSchoolId: entity.eduschooldid,
      eduLevelId: entity.edulevelid,
      eduCourseId: entity.educourseid,
      eduCourseLevelId: entity.educourselevelid,
      schoolYear: entity.schoolyear,
      isActive: entity.isactive,
    });
  }

  async findEmployeesEducation(employeeId: number): Promise<{
    data: Edu[];
  }> {
    const query = `
      SELECT id, employeeid, eduschooldid, edulevelid, educourseid, educourselevelid, schoolyear, isactive 
      FROM edu 
      WHERE employeeid = $1 
      ORDER BY schoolyear DESC
    `;
    const entities = await this.repository.query(query, [employeeId]);

    const data = entities.map(
      (entity: any) =>
        new Edu({
          id: entity.id,
          employeeId: entity.employeeid,
          eduSchoolId: entity.eduschooldid,
          eduLevelId: entity.edulevelid,
          eduCourseId: entity.educourseid,
          eduCourseLevelId: entity.educourselevelid,
          schoolYear: entity.schoolyear,
          isActive: entity.isactive,
        }),
    );

    return { data };
  }
}
