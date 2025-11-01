import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { DeptEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/dept.entity';

export class SeedDepartment {
  private readonly logger = new Logger(SeedDepartment.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const departments = [
      { code: 'hr', desc1: 'human resources', designation: 'hr department' },
      {
        code: 'it',
        desc1: 'information technology',
        designation: 'it department',
      },
      { code: 'fin', desc1: 'finance', designation: 'finance department' },
      {
        code: 'acc',
        desc1: 'accounting',
        designation: 'accounting department',
      },
      { code: 'mkt', desc1: 'marketing', designation: 'marketing department' },
      {
        code: 'adm',
        desc1: 'administration',
        designation: 'administration department',
      },
      { code: 'leg', desc1: 'legal', designation: 'legal department' },
      { code: 'aud', desc1: 'audit', designation: 'internal audit department' },
    ];

    for (const deptData of departments) {
      const existingDept = await this.entityManager.findOne(DeptEntity, {
        where: { code: deptData.code },
      });

      if (!existingDept) {
        const department = this.entityManager.create(DeptEntity, {
          ...deptData,
          isactive: true,
          createdby: 'auto generated',
          updatedby: 'auto generated',
        });

        await this.entityManager.save(department);
        this.logger.log(
          `Created department: ${deptData.desc1} (${deptData.code})`,
        );
      } else {
        this.logger.log(
          `Department already exists: ${deptData.desc1} (${deptData.code})`,
        );
      }
    }
  }
}
