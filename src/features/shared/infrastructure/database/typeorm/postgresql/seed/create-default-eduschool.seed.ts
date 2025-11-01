import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { EduSchoolEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-school.entity';

export class SeedEduSchool {
  private readonly logger = new Logger(SeedEduSchool.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const eduSchools = [
      // Top Universities in Philippines
      'university of the philippines (up)',
      'ateneo de manila university',
      'de la salle university (dlsu)',
      'university of santo tomas (ust)',
      'far eastern university (feu)',
      'university of the east (ue)',
      'polytechnic university of the philippines (pup)',
      'adamson university',
      'centro escolar university (ceu)',
      'mapúa university',
      'san beda university',
      'university of san carlos (usc)',
      'silliman university',
      'xavier university - ateneo de cagayan',
      'ateneo de davao university',
      'university of mindanao',
      'central philippine university (cpu)',
      'west visayas state university (wvsu)',
      'cebu institute of technology - university (cit-u)',
      'university of cebu (uc)',

      // State Universities and Colleges
      'philippine normal university (pnu)',
      'philippine science high school system',
      'university of the philippines diliman',
      'university of the philippines manila',
      'university of the philippines los baños',
      'university of the philippines visayas',
      'university of the philippines mindanao',
      'university of the philippines baguio',
      'university of the philippines cebu',
      'university of the philippines tacloban',
      'university of the philippines open university',
      'mindanao state university (msu)',
      'central luzon state university (cls)',
      'cavite state university (cvs)',
      'bicol university',
      'palawan state university',
      'mariano marcos state university',
      'tarlac state university',
      'pangasinan state university',
      'bulacan state university',

      // Technical and Vocational Schools
      'technical education and skills development authority (tesda)',
      'don bosco technical college',
      'meralco foundation institute',
      'asian institute of computer studies (aics)',
      'sti education services group',
      'ama computer university',
      'systems technology institute (sti)',
      'informatics college',
      'icct colleges',
      'national university (nu)',
      'lyceum of the philippines university',
      'emilio aguinaldo college',
      'colegio de san juan de letran',
      'san sebastian college - recoletos',
      'university of perpetual help system',
      'our lady of fatima university',
      'pamantasan ng lungsod ng maynila (plm)',
      'pamantasan ng lungsod ng pasig',
      'pamantasan ng lungsod ng valenzuela',
      'pamantasan ng lungsod ng muntinlupa',

      // International Schools
      'international school manila (ism)',
      'brent international school',
      'british school manila',
      'chinese international school manila',
      'german european school manila',
      'japanese school manila',
      'korean international school philippines',
      'southville international school',
      'reedley international school',
      'mgc new life christian academy',
      'st. paul college pasig',
      "st. scholastica's college",
      'assumption college',
      'miriam college',
      "st. mary's college",
      "st. theresa's college",
      "st. joseph's college",
      'st. paul university',
      'holy angel university',
      'university of the assumption',

      // Medical and Health Sciences
      'university of the philippines college of medicine',
      'ateneo school of medicine and public health',
      "st. luke's college of medicine",
      'far eastern university - nicanor reyes medical foundation',
      'university of santo tomas faculty of medicine and surgery',
      'de la salle health sciences institute',
      'centro escolar university school of medicine',
      'our lady of fatima university college of medicine',
      'university of perpetual help system - jonelta',
      'cebu institute of medicine',
      "cebu doctors' university",
      'davao medical school foundation',
      'mindanao state university college of medicine',
      'west visayas state university college of medicine',
      'university of the east ramon magsaysay memorial medical center',

      // Engineering and Technology
      'mapúa institute of technology',
      'technological institute of the philippines (tip)',
      'don bosco technical college',
      'meralco foundation institute',
      'asian institute of maritime studies (aims)',
      'philippine merchant marine academy',
      'maritime academy of Asia and the Pacific (maap)',
      'john B. Lacson Foundation Maritime University',
      'palompon institute of technology',
      'cebu technological university',
      'bicol university college of engineering',
      'central luzon state university college of engineering',
      'mindanao state university - iligan institute of technology',
      'university of the philippines college of engineering',
      'ateneo de manila university school of science and engineering',

      // Business and Management
      'asian institute of management (aim)',
      'de la salle university - ramon V. del Rosario College of Business',
      'ateneo de manila university john Gokongwei School of Management',
      'university of the philippines college of business administration',
      'university of santo tomas alfredo M. Velayo College of Accountancy',
      'far eastern university institute of accounts, business and finance',
      'polytechnic university of the philippines college of business',
      'university of the east college of business administration',
      'adamson university college of business administration',
      'centro escolar university school of business and management',

      // Law Schools
      'university of the philippines college of law',
      'ateneo de manila university school of law',
      'university of santo tomas faculty of civil law',
      'san beda university college of law',
      'far eastern university institute of law',
      'university of the east college of law',
      'arellano university school of law',
      'lyceum of the philippines university college of law',
      'manuel L. Quezon University School of Law',
      'polytechnic university of the philippines college of law',

      // Other Notable Schools
      'philippine high school for the arts',
      'philippine science high school',
      'makati science high school',
      'quezon city science high school',
      'manila science high school',
      'rizal high school',
      'pasig city science high school',
      'valenzuela science high school',
      'caloocan city science high school',
      'malabon national high school',

      // International and Foreign Schools
      'international school of manila',
      'brent international school',
      'british school manila',
      'german european school manila',
      'japanese school manila',
      'korean international school philippines',
      'chinese international school manila',
      'french school of manila',
      'australian international school manila',
      'canadian international school',

      // Online and Distance Learning
      'university of the philippines open university',
      'ama online education',
      'sti online education',
      'informatics online',
      'lyceum online',
      'national university online',
      'polytechnic university of the philippines open university',
      'university of the east online',
      'far eastern university online',
      'centro escolar university online',
    ];

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
          isactive: false,
          createdby: 'system',
          updatedby: 'system',
        });

        await this.entityManager.save(eduSchoolEntity);
        this.logger.log(`Created education school: ${eduSchool}`);
      } else {
        this.logger.log(`Education school already exists: ${eduSchool}`);
      }
    }
  }
}
