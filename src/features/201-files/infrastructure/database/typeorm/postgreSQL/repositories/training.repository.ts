import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TrainingEntity } from '../entities/training.entity';
import { TrainingRepository } from '@features/201-files/domain/repositories/training.repository';
import { Training } from '@features/201-files/domain/models/training.model';

@Injectable()
export class TrainingRepositoryImpl
  implements TrainingRepository<EntityManager>
{
  constructor(
    @InjectRepository(TrainingEntity)
    private readonly repository: Repository<TrainingEntity>,
  ) {}

  async create(training: Training, manager: EntityManager): Promise<Training> {
    const query = `
      INSERT INTO training (employeeid, trainingdate, trainingscertid, trainingtitle, desc1, imagepath) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, employeeid, trainingdate::text as trainingdate, trainingscertid, trainingtitle, desc1, imagepath, isactive
    `;
    const result = await manager.query(query, [
      training.employeeId,
      training.trainingDate,
      training.trainingsCertId,
      training.trainingTitle,
      training.desc1,
      training.imagePath,
    ]);

    const entity = result[0];
    return new Training({
      id: entity.id,
      employeeId: entity.employeeid,
      trainingDate: entity.trainingdate,
      trainingsCertId: entity.trainingscertid,
      trainingTitle: entity.trainingtitle,
      desc1: entity.desc1,
      imagePath: entity.imagepath,
      isActive: entity.isactive,
    });
  }

  async update(
    id: number,
    dto: Partial<Training>,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE training 
      SET  trainingdate = $1, trainingscertid = $2, trainingtitle = $3, desc1 = $4, imagepath = $5
      WHERE id = $6
    `;
    const result = await manager.query(query, [
      dto.trainingDate,
      dto.trainingsCertId,
      dto.trainingTitle,
      dto.desc1,
      dto.imagePath,
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
      UPDATE training 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);
    return result[1] > 0; // result[1] is the rowCount
  }

  async findById(id: number, manager: EntityManager): Promise<Training | null> {
    const query = `
      SELECT id, employeeid, trainingdate::text as trainingdate, trainingscertid, trainingtitle, desc1, imagepath, isactive 
      FROM training 
      WHERE id = $1
    `;
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new Training({
      id: entity.id,
      employeeId: entity.employeeid,
      trainingDate: entity.trainingdate,
      trainingsCertId: entity.trainingscertid,
      trainingTitle: entity.trainingtitle,
      desc1: entity.desc1,
      imagePath: entity.imagepath,
      isActive: entity.isactive,
    });
  }

  async findEmployeesTraining(employeeId: number): Promise<{
    data: Training[];
  }> {
    const query = `
      SELECT id, employeeid, trainingdate::text as trainingdate, trainingscertid, trainingtitle, desc1, imagepath, isactive 
      FROM training 
      WHERE employeeid = $1
      ORDER BY trainingdate DESC
    `;
    const entities = await this.repository.query(query, [employeeId]);

    const data = entities.map(
      (entity: any) =>
        new Training({
          id: entity.id,
          employeeId: entity.employeeid,
          trainingDate: entity.trainingdate,
          trainingsCertId: entity.trainingscertid,
          trainingTitle: entity.trainingtitle,
          desc1: entity.desc1,
          imagePath: entity.imagepath,
          isActive: entity.isactive,
        }),
    );

    return { data };
  }
}
