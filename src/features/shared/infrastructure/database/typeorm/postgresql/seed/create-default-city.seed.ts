import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { CityEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/city.entity';

export class SeedCity {
  private readonly logger = new Logger(SeedCity.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const cities = [
      'default',
      'davao city',
      'valencia city',
      'tagum city',
      'digos city',
    ];

    for (const city of cities) {
      const existingCity = await this.entityManager.findOne(CityEntity, {
        where: { desc1: city },
      });

      if (!existingCity) {
        const cityEntity = this.entityManager.create(CityEntity, {
          desc1: city,
          isactive: true,
          createdby: 'auto generated',
          updatedby: 'auto generated',
        });

        await this.entityManager.save(cityEntity);
        this.logger.log(`Created city: ${city}`);
      } else {
        this.logger.log(`City already exists: ${city}`);
      }
    }
  }
}
