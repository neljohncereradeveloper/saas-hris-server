import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { JobTitleEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/jobtitle.entity';

export class SeedJobTitle {
  private readonly logger = new Logger(SeedJobTitle.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const jobTitles = [
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

    for (const jobTitle of jobTitles) {
      const existingJobTitle = await this.entityManager.findOne(
        JobTitleEntity,
        {
          where: { desc1: jobTitle },
        },
      );

      if (!existingJobTitle) {
        const jobTitleEntity = this.entityManager.create(JobTitleEntity, {
          desc1: jobTitle,
          isactive: true,
          createdby: 'auto generated',
          updatedby: 'auto generated',
        });

        await this.entityManager.save(jobTitleEntity);
        this.logger.log(`Created job title: ${jobTitle}`);
      } else {
        this.logger.log(`Job title already exists: ${jobTitle}`);
      }
    }
  }
}
