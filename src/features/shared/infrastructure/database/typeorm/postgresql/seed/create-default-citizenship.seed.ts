import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { CitizenShipEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/citizenship.entity';

export class SeedCitizenship {
  private readonly logger = new Logger(SeedCitizenship.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const citizenships = [
      // Philippine Citizenship
      'filipino',
      'other',
    ];

    for (const citizenship of citizenships) {
      const existingCitizenship = await this.entityManager.findOne(
        CitizenShipEntity,
        {
          where: { desc1: citizenship },
        },
      );

      if (!existingCitizenship) {
        const citizenshipEntity = this.entityManager.create(CitizenShipEntity, {
          desc1: citizenship,
          isactive: true,
          createdby: 'auto generated',
          updatedby: 'auto generated',
        });

        await this.entityManager.save(citizenshipEntity);
        this.logger.log(`Created citizenship: ${citizenship}`);
      } else {
        this.logger.log(`Citizenship already exists: ${citizenship}`);
      }
    }
  }
}
