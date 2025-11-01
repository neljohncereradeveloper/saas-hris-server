import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { WorkExpJobTitleEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/workexp-jobtitle.entity';

export class SeedWorkExpJobTitle {
  private readonly logger = new Logger(SeedWorkExpJobTitle.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const workExpJobTitles = [
      // Executive Level
      'department head',
      'full stack developer',
      'it specialist hardware',
      'it specialist software',
      'general manager',
      'branch manager',
      'supervisor',
      'payroll master',
      'hr specialist',
    ];

    for (const workExpJobTitle of workExpJobTitles) {
      const existingJobTitle = await this.entityManager.findOne(
        WorkExpJobTitleEntity,
        {
          where: { desc1: workExpJobTitle },
        },
      );

      if (!existingJobTitle) {
        const workExpJobTitleEntity = this.entityManager.create(
          WorkExpJobTitleEntity,
          {
            desc1: workExpJobTitle,
            isactive: true,
            createdby: 'auto generated',
            updatedby: 'auto generated',
          },
        );

        await this.entityManager.save(workExpJobTitleEntity);
        this.logger.log(`Created work exp job title: ${workExpJobTitle}`);
      } else {
        this.logger.log(
          `Work exp job title already exists: ${workExpJobTitle}`,
        );
      }
    }
  }
}
