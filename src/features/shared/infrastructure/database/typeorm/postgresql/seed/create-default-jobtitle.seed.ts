import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { JobTitleEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/jobtitle.entity';

export class SeedJobTitle {
  private readonly logger = new Logger(SeedJobTitle.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const jobTitles = [
      // Executive Level
      'chief executive officer (ceo)',
      'chief operating officer (coo)',
      'chief financial officer (cfo)',
      'chief technology officer (cto)',
      'chief marketing officer (cmo)',
      'chief human resources officer (chro)',
      'president',
      'vice president',
      'managing director',
      'general manager',

      // Senior Management
      'senior manager',
      'manager',
      'assistant manager',
      'department head',
      'division head',
      'director',
      'senior director',

      // Middle Management
      'supervisor',
      'senior supervisor',
      'team lead',
      'senior team lead',
      'coordinator',
      'senior coordinator',
      'specialist',
      'senior specialist',

      // Professional Level
      'analyst',
      'senior analyst',
      'associate',
      'senior associate',
      'consultant',
      'senior consultant',
      'advisor',
      'senior advisor',

      // Technical Roles
      'software engineer',
      'senior software engineer',
      'lead software engineer',
      'system administrator',
      'senior system administrator',
      'database administrator',
      'network administrator',
      'it support specialist',
      'technical support',
      'quality assurance engineer',
      'devops engineer',

      // HR Roles
      'hr manager',
      'hr specialist',
      'hr generalist',
      'recruitment specialist',
      'training specialist',
      'compensation and benefits specialist',
      'employee relations specialist',

      // Finance & Accounting
      'accountant',
      'senior accountant',
      'financial analyst',
      'senior financial analyst',
      'auditor',
      'senior auditor',
      'tax specialist',
      'budget analyst',

      // Sales & Marketing
      'sales manager',
      'sales representative',
      'senior sales representative',
      'account manager',
      'marketing manager',
      'marketing specialist',
      'digital marketing specialist',
      'brand manager',
      'product manager',

      // Operations
      'operations manager',
      'operations specialist',
      'project manager',
      'senior project manager',
      'process improvement specialist',
      'supply chain manager',
      'logistics coordinator',

      // Administrative
      'executive assistant',
      'administrative assistant',
      'office manager',
      'receptionist',
      'secretary',
      'clerk',
      'data entry specialist',

      // Customer Service
      'customer service manager',
      'customer service representative',
      'call center agent',
      'customer success manager',

      // Security & Maintenance
      'security guard',
      'security supervisor',
      'maintenance technician',
      'facilities manager',

      // Entry Level
      'intern',
      'trainee',
      'junior associate',
      'assistant',
      'entry level',
    ];

    for (const jobTitle of jobTitles) {
      const existingJobTitle = await this.entityManager.findOne(
        JobTitleEntity,
        {
          where: { desc1: jobTitle },
        },
      );

      if (!existingJobTitle) {
        const jobTitleEntity = this.entityManager.create(JobTitleEntity, {
          desc1: jobTitle,
          isactive: false,
          createdby: 'system',
          updatedby: 'system',
        });

        await this.entityManager.save(jobTitleEntity);
        this.logger.log(`Created job title: ${jobTitle}`);
      } else {
        this.logger.log(`Job title already exists: ${jobTitle}`);
      }
    }
  }
}
