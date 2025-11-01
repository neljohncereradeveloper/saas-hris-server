import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { BarangayEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/barangay.entity';

export class SeedBarangay {
  private readonly logger = new Logger(SeedBarangay.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const barangays = ['not specified', 'default'];

    for (const barangay of barangays) {
      const existingBarangay = await this.entityManager.findOne(
        BarangayEntity,
        {
          where: { desc1: barangay },
        },
      );

      if (!existingBarangay) {
        const barangayEntity = this.entityManager.create(BarangayEntity, {
          desc1: barangay,
          isactive: true,
          createdby: 'system',
          updatedby: 'system',
        });

        await this.entityManager.save(barangayEntity);
        this.logger.log(`Created barangay: ${barangay}`);
      } else {
        this.logger.log(`Barangay already exists: ${barangay}`);
      }
    }
  }
}
