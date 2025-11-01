import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { EduCourseEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-course.entity';

export class SeedEduCourse {
  private readonly logger = new Logger(SeedEduCourse.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const eduCourses = [
      // Business & Management
      'business administration',
      'business management',
      'entrepreneurship',
      'marketing',
      'finance',
      'accounting',
      'economics',
      'international business',
      'human resource management',
      'operations management',
      'supply chain management',
      'project management',
      'public administration',
      'hotel and restaurant management',
      'tourism management',

      // Information Technology
      'computer science',
      'information technology',
      'information systems',
      'software engineering',
      'computer engineering',
      'data science',
      'cybersecurity',
      'network administration',
      'database administration',
      'web development',
      'mobile app development',
      'game development',
      'artificial intelligence',
      'machine learning',
      'digital marketing',

      // Engineering
      'civil engineering',
      'mechanical engineering',
      'electrical engineering',
      'electronics engineering',
      'chemical engineering',
      'industrial engineering',
      'aerospace engineering',
      'environmental engineering',
      'biomedical engineering',
      'petroleum engineering',
      'mining engineering',
      'geodetic engineering',
      'sanitary engineering',
      'marine engineering',
      'agricultural engineering',

      // Healthcare & Medicine
      'medicine',
      'nursing',
      'pharmacy',
      'dentistry',
      'physical therapy',
      'occupational therapy',
      'medical technology',
      'radiologic technology',
      'respiratory therapy',
      'veterinary medicine',
      'psychology',
      'social work',
      'public health',
      'health administration',
      'nutrition and dietetics',

      // Education
      'elementary education',
      'secondary education',
      'special education',
      'early childhood education',
      'physical education',
      'music education',
      'art education',
      'english education',
      'mathematics education',
      'science education',
      'social studies education',
      'filipino education',
      'educational administration',
      'guidance and counseling',
      'library and information science',

      // Liberal Arts & Social Sciences
      'political science',
      'international relations',
      'sociology',
      'anthropology',
      'history',
      'philosophy',
      'literature',
      'english',
      'filipino',
      'communication',
      'journalism',
      'mass communication',
      'broadcasting',
      'public relations',
      'advertising',

      // Natural Sciences
      'biology',
      'chemistry',
      'physics',
      'mathematics',
      'statistics',
      'environmental science',
      'marine biology',
      'geology',
      'meteorology',
      'astronomy',
      'biotechnology',
      'food technology',
      'agricultural science',
      'forestry',
      'fisheries',

      // Architecture & Design
      'architecture',
      'interior design',
      'landscape architecture',
      'urban planning',
      'fine arts',
      'graphic design',
      'industrial design',
      'fashion design',
      'multimedia arts',
      'animation',
      'film and television',
      'theater arts',
      'music',
      'dance',
      'creative writing',

      // Law & Legal Studies
      'law',
      'legal management',
      'criminology',
      'forensic science',
      'police science',
      'security management',

      // Technical & Vocational
      'automotive technology',
      'electronics technology',
      'electrical technology',
      'mechanical technology',
      'welding technology',
      'plumbing technology',
      'carpentry',
      'masonry',
      'drafting technology',
      'computer hardware servicing',
      'network cabling',
      'refrigeration and air conditioning',
      'food and beverage service',
      'housekeeping',
      'beauty and wellness',

      // Maritime & Aviation
      'maritime transportation',
      'marine engineering',
      'aviation',
      'aeronautical engineering',
      'air traffic control',
      'flight operations',

      // Agriculture & Fisheries
      'agriculture',
      'agribusiness',
      'animal science',
      'crop science',
      'soil science',
      'fisheries',
      'aquaculture',
      'forestry',
      'veterinary science',

      // Other
      'general studies',
      'liberal arts',
      'multidisciplinary studies',
      'custom program',
      'non-degree program',
      'certificate program',
      'diploma program',
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
          isactive: false,
          createdby: 'system',
          updatedby: 'system',
        });

        await this.entityManager.save(eduCourseEntity);
        this.logger.log(`Created education course: ${eduCourse}`);
      } else {
        this.logger.log(`Education course already exists: ${eduCourse}`);
      }
    }
  }
}
