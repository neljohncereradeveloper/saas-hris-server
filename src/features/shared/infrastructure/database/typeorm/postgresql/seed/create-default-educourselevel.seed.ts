import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { EduCourseLevelEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-courselevel.entity';

export class SeedEduCourseLevel {
  private readonly logger = new Logger(SeedEduCourseLevel.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const eduCourseLevels = [
      // Basic Education Levels
      'elementary',
      'high school',
      'senior high school',

      // Technical/Vocational Levels
      'certificate',
      'diploma',
      'associate degree',
      'technical certificate',
      'vocational certificate',

      // Higher Education Levels
      "bachelor's degree",
      "master's degree",
      'doctorate',
      'post-doctorate',

      // Professional Levels
      'professional license',
      'board certification',
      'professional certificate',
      'industry certification',

      // Specialized Levels
      'graduate certificate',
      'post-graduate diploma',
      'executive program',
      'continuing education',
      'professional development',

      // International Levels
      'international baccalaureate',
      'a-levels',
      'o-levels',
      'ged',

      // Other Levels
      'foundation program',
      'preparatory program',
      'bridge program',
      'extension program',
      'distance learning',
      'online program',
      'part-time program',
      'full-time program',
      'intensive program',
      'accelerated program',
      'dual degree',
      'joint degree',
      'exchange program',
      'study abroad',
      'internship program',
      'apprenticeship program',
      'on-the-job training',
      'work-study program',
      'co-op program',
      'thesis program',
      'non-thesis program',
      'research program',
      'coursework program',
      'comprehensive exam',
      'oral defense',
      'capstone project',
      'final project',
      'portfolio',
      'practicum',
      'clinical',
      'field work',
      'laboratory work',
      'studio work',
      'workshop',
      'seminar',
      'conference',
      'symposium',
      'colloquium',
      'tutorial',
      'independent study',
      'directed study',
      'special topics',
      'elective',
      'core course',
      'prerequisite',
      'co-requisite',
      'audit',
      'pass/fail',
      'credit/no credit',
      'incomplete',
      'withdrawal',
      'drop',
      'add',
      'transfer credit',
      'advanced placement',
      'credit by examination',
      'life experience credit',
      'prior learning assessment',
      'recognition of prior learning',
      'work experience credit',
      'military credits',
      'professional experience credit',
    ];

    for (const eduCourseLevel of eduCourseLevels) {
      const existingEduCourseLevel = await this.entityManager.findOne(
        EduCourseLevelEntity,
        {
          where: { desc1: eduCourseLevel },
        },
      );

      if (!existingEduCourseLevel) {
        const eduCourseLevelEntity = this.entityManager.create(
          EduCourseLevelEntity,
          {
            desc1: eduCourseLevel,
            isactive: false,
            createdby: 'system',
            updatedby: 'system',
          },
        );

        await this.entityManager.save(eduCourseLevelEntity);
        this.logger.log(`Created education course level: ${eduCourseLevel}`);
      } else {
        this.logger.log(
          `Education course level already exists: ${eduCourseLevel}`,
        );
      }
    }
  }
}
