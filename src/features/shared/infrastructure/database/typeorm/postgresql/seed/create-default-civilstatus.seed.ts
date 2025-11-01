import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { CivilStatusEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/civilstatus.entity';

export class SeedCivilStatus {
  private readonly logger = new Logger(SeedCivilStatus.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const civilStatuses = [
      'single',
      'married',
      'widowed',
      'divorced',
      'separated',
      'annulled',
      'legally separated',
    ];

    for (const civilStatus of civilStatuses) {
      const existingCivilStatus = await this.entityManager.findOne(
        CivilStatusEntity,
        {
          where: { desc1: civilStatus },
        },
      );

      if (!existingCivilStatus) {
        const civilStatusEntity = this.entityManager.create(CivilStatusEntity, {
          desc1: civilStatus,
          isactive: true,
          createdby: 'auto generated',
          updatedby: 'auto generated',
        });

        await this.entityManager.save(civilStatusEntity);
        this.logger.log(`Created civil status: ${civilStatus}`);
      } else {
        this.logger.log(`Civil status already exists: ${civilStatus}`);
      }
    }
  }
}
