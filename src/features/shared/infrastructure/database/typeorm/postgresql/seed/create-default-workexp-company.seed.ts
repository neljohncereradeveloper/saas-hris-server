import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { WorkExpCompanyEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/workexp-company.entity';

export class SeedWorkExpCompany {
  private readonly logger = new Logger(SeedWorkExpCompany.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const workExpCompanies = ['default'];

    for (const workExpCompany of workExpCompanies) {
      const existingWorkExpCompany = await this.entityManager.findOne(
        WorkExpCompanyEntity,
        {
          where: { desc1: workExpCompany },
        },
      );

      if (!existingWorkExpCompany) {
        const workExpCompanyEntity = this.entityManager.create(
          WorkExpCompanyEntity,
          {
            desc1: workExpCompany,
            isactive: true,
            createdby: 'auto generated',
            updatedby: 'auto generated',
          },
        );

        await this.entityManager.save(workExpCompanyEntity);
        this.logger.log(`Created work exp company: ${workExpCompany}`);
      } else {
        this.logger.log(`Work exp company already exists: ${workExpCompany}`);
      }
    }
  }
}
