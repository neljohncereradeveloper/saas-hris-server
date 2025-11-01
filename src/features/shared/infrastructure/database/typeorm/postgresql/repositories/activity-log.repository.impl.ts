import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ActivityLogEntity } from '../entities/activity-log.entity';
import { ActivityLogRepository } from 'src/features/shared/domain/repositories/activity-log.repository';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

@Injectable()
export class ActivityLogRepositoryImpl
  implements ActivityLogRepository<EntityManager>
{
  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly repository: Repository<ActivityLogEntity>,
  ) {}

  async create(log: ActivityLog, manager: EntityManager): Promise<ActivityLog> {
    const insertQuery = `
      INSERT INTO ${CONSTANTS_DATABASE_MODELS.ACTIVITYLOGS} (
        action, entity, details, metadata, ipaddress, useragent, 
        sessionid, userid, username, description, issuccess, 
        errormessage, statuscode, duration, createdby, createdat
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING *
    `;

    const values = [
      log.action,
      log.entity,
      log.details,
      log.metadata,
      log.ipAddress,
      log.userAgent,
      log.sessionId,
      log.userId,
      log.username,
      log.description,
      log.isSuccess,
      log.errorMessage,
      log.statusCode,
      log.duration,
      log.createdBy,
      log.createdAt,
    ];

    const result = await manager.query(insertQuery, values);
    const savedEntity = result[0];
    return this.toModel(savedEntity);
  }

  async findAll(): Promise<ActivityLog[]> {
    const selectQuery = `
      SELECT * FROM ${CONSTANTS_DATABASE_MODELS.ACTIVITYLOGS}
      ORDER BY createdat DESC
    `;

    const entities = await this.repository.query(selectQuery);
    return entities.map(this.toModel);
  }

  async findByEntity(entity: string): Promise<ActivityLog[]> {
    const selectQuery = `
      SELECT * FROM ${CONSTANTS_DATABASE_MODELS.ACTIVITYLOGS}
      WHERE entity = $1
      ORDER BY createdat DESC
    `;

    const entities = await this.repository.query(selectQuery, [entity]);
    return entities.map(this.toModel);
  }

  async findByAction(action: string): Promise<ActivityLog[]> {
    const selectQuery = `
      SELECT * FROM ${CONSTANTS_DATABASE_MODELS.ACTIVITYLOGS}
      WHERE action = $1
      ORDER BY createdat DESC
    `;

    const entities = await this.repository.query(selectQuery, [action]);
    return entities.map(this.toModel);
  }

  private toModel(rawResult: any): ActivityLog {
    const log = new ActivityLog(
      rawResult.action,
      rawResult.entity,
      rawResult.userid,
      {
        details: rawResult.details || undefined,
        metadata: rawResult.metadata || undefined,
        ipAddress: rawResult.ipaddress || undefined,
        userAgent: rawResult.useragent || undefined,
        sessionId: rawResult.sessionid || undefined,
        username: rawResult.username || undefined,
        description: rawResult.description || undefined,
        isSuccess: rawResult.issuccess,
        errorMessage: rawResult.errormessage || undefined,
        statusCode: rawResult.statuscode || undefined,
        duration: rawResult.duration || undefined,
        createdBy: rawResult.createdby,
      },
    );
    log.id = rawResult.id;
    log.createdAt = rawResult.createdat;
    return log;
  }
}
