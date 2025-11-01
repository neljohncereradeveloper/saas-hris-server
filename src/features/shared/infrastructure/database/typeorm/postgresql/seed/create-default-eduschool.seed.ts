import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { EduSchoolEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-school.entity';

export class SeedEduSchool {
  private readonly logger = new Logger(SeedEduSchool.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const eduSchools = ['default'];

    for (const eduSchool of eduSchools) {
      const existingEduSchool = await this.entityManager.findOne(
        EduSchoolEntity,
        {
          where: { desc1: eduSchool },
        },
      );

      if (!existingEduSchool) {
        const eduSchoolEntity = this.entityManager.create(EduSchoolEntity, {
          desc1: eduSchool,
          isactive: true,
          createdby: 'auto generated',
          updatedby: 'auto generated',
        });

        await this.entityManager.save(eduSchoolEntity);
        this.logger.log(`Created education school: ${eduSchool}`);
      } else {
        this.logger.log(`Education school already exists: ${eduSchool}`);
      }
    }
  }
}
