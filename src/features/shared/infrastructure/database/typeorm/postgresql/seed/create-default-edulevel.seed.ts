import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { EduLevelEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-level.entity';

export class SeedEduLevel {
  private readonly logger = new Logger(SeedEduLevel.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const eduLevels = [
      // Basic Education (Philippines)
      'elementary',
      'high school',
      'senior high school',
      'college',
    ];

    for (const eduLevel of eduLevels) {
      const existingEduLevel = await this.entityManager.findOne(
        EduLevelEntity,
        {
          where: { desc1: eduLevel },
        },
      );

      if (!existingEduLevel) {
        const eduLevelEntity = this.entityManager.create(EduLevelEntity, {
          desc1: eduLevel,
          isactive: true,
          createdby: 'auto generated',
          updatedby: 'auto generated',
        });

        await this.entityManager.save(eduLevelEntity);
        this.logger.log(`Created education level: ${eduLevel}`);
      } else {
        this.logger.log(`Education level already exists: ${eduLevel}`);
      }
    }
  }
}
