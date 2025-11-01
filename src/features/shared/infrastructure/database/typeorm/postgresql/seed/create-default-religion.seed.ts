import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ReligionEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/religion.entity';

export class SeedReligion {
  private readonly logger = new Logger(SeedReligion.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const religions = [
      // Major Religions in Philippines
      'roman catholic',
      'islam',
      'protestant',
      'iglesia ni cristo',
      "jehovah's witnesses",
      'seventh-day adventist',
      'baptist',
      'methodist',
      'presbyterian',
      'anglican',
      'lutheran',
      'pentecostal',
      'assemblies of god',
      'united church of christ in the philippines',
      'buddhism',
      'hinduism',
      'judaism',
      'sikhism',
      "bahá'í faith",
      'mormon (lds)',
      'unitarian universalist',
      'agnostic',
      'atheist',
      'non-religious',
      'other',
      'prefer not to say',
    ];

    for (const religion of religions) {
      const existingReligion = await this.entityManager.findOne(
        ReligionEntity,
        {
          where: { desc1: religion },
        },
      );

      if (!existingReligion) {
        const religionEntity = this.entityManager.create(ReligionEntity, {
          desc1: religion,
          isactive: true,
          createdby: 'system',
          updatedby: 'system',
        });

        await this.entityManager.save(religionEntity);
        this.logger.log(`Created religion: ${religion}`);
      } else {
        this.logger.log(`Religion already exists: ${religion}`);
      }
    }
  }
}
