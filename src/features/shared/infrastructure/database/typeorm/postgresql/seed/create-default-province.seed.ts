import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ProvinceEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/province.entity';

export class SeedProvince {
  private readonly logger = new Logger(SeedProvince.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const provinces = [
      // National Capital Region (NCR)
      'metro manila',

      // Region I - Ilocos Region
      'ilocos norte',
      'ilocos sur',
      'la union',
      'pangasinan',

      // Region II - Cagayan Valley
      'batanes',
      'cagayan',
      'isabela',
      'nueva vizcaya',
      'quirino',

      // Region III - Central Luzon
      'aurora',
      'bataan',
      'bulacan',
      'nueva ecija',
      'pampanga',
      'tarlac',
      'zambales',

      // Region IV-A - CALABARZON
      'batangas',
      'cavite',
      'laguna',
      'quezon',
      'rizal',

      // Region IV-B - MIMAROPA
      'marinduque',
      'occidental mindoro',
      'oriental mindoro',
      'palawan',
      'romblon',

      // Region V - Bicol Region
      'albay',
      'camarines norte',
      'camarines sur',
      'catanduanes',
      'masbate',
      'sorsogon',

      // Region VI - Western Visayas
      'aklan',
      'antique',
      'capiz',
      'guimaras',
      'iloylo',
      'negros occidental',

      // Region VII - Central Visayas
      'bohol',
      'cebu',
      'negros oriental',
      'siquijor',

      // Region VIII - Eastern Visayas
      'biliran',
      'eastern samar',
      'leyte',
      'northern samar',
      'samar',
      'southern leyte',

      // Region IX - Zamboanga Peninsula
      'zamboanga del norte',
      'zamboanga del sur',
      'zamboanga sibugay',

      // Region X - Northern Mindanao
      'bukidnon',
      'camiguin',
      'lanao del norte',
      'misamis occidental',
      'misamis oriental',

      // Region XI - Davao Region
      'compostela valley',
      'davao del norte',
      'davao del sur',
      'davao occidental',
      'davao oriental',

      // Region XII - SOCCSKSARGEN
      'cotabato',
      'sarangani',
      'south cotabato',
      'sultan kudarat',

      // Region XIII - Caraga
      'agusan del norte',
      'agusan del sur',
      'dinagat islands',
      'surigao del norte',
      'surigao del sur',

      // Autonomous Region in Muslim Mindanao (ARMM)
      'basilan',
      'lanao del sur',
      'maguindanao',
      'sulu',
      'tawi-tawi',

      // Cordillera Administrative Region (CAR)
      'abra',
      'apayao',
      'benguet',
      'ifugao',
      'kalinga',
      'mountain province',

      // Other
      'other',
      'not specified',
      'unknown',
    ];

    for (const province of provinces) {
      const existingProvince = await this.entityManager.findOne(
        ProvinceEntity,
        {
          where: { desc1: province },
        },
      );

      if (!existingProvince) {
        const provinceEntity = this.entityManager.create(ProvinceEntity, {
          desc1: province,
          isactive: true,
          createdby: 'system',
          updatedby: 'system',
        });

        await this.entityManager.save(provinceEntity);
        this.logger.log(`Created province: ${province}`);
      } else {
        this.logger.log(`Province already exists: ${province}`);
      }
    }
  }
}
