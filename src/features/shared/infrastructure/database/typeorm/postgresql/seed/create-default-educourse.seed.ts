import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { EduCourseEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-course.entity';

export class SeedEduCourse {
  private readonly logger = new Logger(SeedEduCourse.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const eduCourses = [
      'bachelor of science in business administration',
      'bachelor of science in computer science',
      'bachelor of science in information technology',
      'bachelor of science in information systems',
      'bachelor of science in software engineering',
      'bachelor of science in computer engineering',
      // Business & Management
      'bachelor of science in business administration',
      'bachelor of science in business management',
      'bachelor of science in entrepreneurship',
      'bachelor of science in marketing',
      'bachelor of science in finance',
      'bachelor of science in accounting',
      'bachelor of science in international business',
      'bachelor of science in human resource management',
    ];

    for (const eduCourse of eduCourses) {
      const existingEduCourse = await this.entityManager.findOne(
        EduCourseEntity,
        {
          where: { desc1: eduCourse },
        },
      );

      if (!existingEduCourse) {
        const eduCourseEntity = this.entityManager.create(EduCourseEntity, {
          desc1: eduCourse,
          isactive: true,
          createdby: 'auto generated',
          updatedby: 'auto generated',
        });

        await this.entityManager.save(eduCourseEntity);
        this.logger.log(`Created education course: ${eduCourse}`);
      } else {
        this.logger.log(`Education course already exists: ${eduCourse}`);
      }
    }
  }
}
