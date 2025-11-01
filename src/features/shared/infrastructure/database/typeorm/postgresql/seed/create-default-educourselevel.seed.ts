import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { EduCourseLevelEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-courselevel.entity';

export class SeedEduCourseLevel {
  private readonly logger = new Logger(SeedEduCourseLevel.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const eduCourseLevels = [
      // Basic Education Levels
      'elementary',
      'high school',
      'senior high school',
      'college',

      // Higher Education Levels
      "bachelor's degree",
      "master's degree",
      'doctorate',
    ];

    for (const eduCourseLevel of eduCourseLevels) {
      const existingEduCourseLevel = await this.entityManager.findOne(
        EduCourseLevelEntity,
        {
          where: { desc1: eduCourseLevel },
        },
      );

      if (!existingEduCourseLevel) {
        const eduCourseLevelEntity = this.entityManager.create(
          EduCourseLevelEntity,
          {
            desc1: eduCourseLevel,
            isactive: true,
            createdby: 'auto generated',
            updatedby: 'auto generated',
          },
        );

        await this.entityManager.save(eduCourseLevelEntity);
        this.logger.log(`Created education course level: ${eduCourseLevel}`);
      } else {
        this.logger.log(
          `Education course level already exists: ${eduCourseLevel}`,
        );
      }
    }
  }
}
