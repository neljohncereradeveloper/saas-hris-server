import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { EmpStatusEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/empstatus.entity';

export class SeedEmpStatus {
  private readonly logger = new Logger(SeedEmpStatus.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const empStatuses = [
      'active',
      'regular',
      'probationary',
      'contractual',
      'project-based',
      'part-time',
      'full-time',
      'intern',
      'on leave',
      'suspended',
      'terminated',
      'resigned',
      'retired',
      'awol (absent without leave)',
      'on secondment',
      'on study leave',
      'on maternity leave',
      'on paternity leave',
      'on sick leave',
      'on vacation leave',
      'on emergency leave',
    ];

    for (const empStatus of empStatuses) {
      const existingEmpStatus = await this.entityManager.findOne(
        EmpStatusEntity,
        {
          where: { desc1: empStatus },
        },
      );

      if (!existingEmpStatus) {
        const empStatusEntity = this.entityManager.create(EmpStatusEntity, {
          desc1: empStatus,
          isactive: true,
          createdby: 'auto generated',
          updatedby: 'auto generated',
        });

        await this.entityManager.save(empStatusEntity);
        this.logger.log(`Created employment status: ${empStatus}`);
      } else {
        this.logger.log(`Employment status already exists: ${empStatus}`);
      }
    }
  }
}
