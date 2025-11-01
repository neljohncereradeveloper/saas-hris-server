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

      // Technical/Vocational
      'technical/vocational',
      'certificate program',
      'diploma',
      'associate degree',

      // Higher Education
      "bachelor's degree",
      "master's degree",
      'doctorate/phd',
      'post-doctorate',

      // Professional
      'professional license',
      'board exam passer',
      'professional certification',

      // Specialized
      'graduate certificate',
      'post-graduate diploma',
      'executive education',
      'continuing education',

      // International Equivalents
      'ged (general educational development)',
      'international baccalaureate',
      'a-levels',
      'o-levels',

      // Other
      'some college',
      'some high school',
      'no formal education',
      'self-taught',
      'online education',
      'distance learning',
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
          isactive: false,
          createdby: 'system',
          updatedby: 'system',
        });

        await this.entityManager.save(eduLevelEntity);
        this.logger.log(`Created education level: ${eduLevel}`);
      } else {
        this.logger.log(`Education level already exists: ${eduLevel}`);
      }
    }
  }
}
