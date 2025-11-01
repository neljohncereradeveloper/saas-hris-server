import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { EmployeeMovementTypeEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/employee-movement-type.entity';

export class SeedEmployeeMovementType {
  private readonly logger = new Logger(SeedEmployeeMovementType.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const employeeMovementTypes = [
      'TRANSFER',
      'PROMOTION',
      'DEMOTION',
      'LATERAL_MOVE',
      'DEPARTMENT_CHANGE',
      'BRANCH_CHANGE',
    ];

    for (const employeeMovementType of employeeMovementTypes) {
      const existingEmployeeMovementType = await this.entityManager.findOne(
        EmployeeMovementTypeEntity,
        {
          where: { desc1: employeeMovementType },
        },
      );

      if (!existingEmployeeMovementType) {
        const employeeMovementTypeEntity = this.entityManager.create(
          EmployeeMovementTypeEntity,
          {
            desc1: employeeMovementType,
            isactive: true,
            createdby: 'auto generated',
            updatedby: 'auto generated',
          },
        );

        await this.entityManager.save(employeeMovementTypeEntity);
        this.logger.log(
          `Created employee movement type: ${employeeMovementType}`,
        );
      } else {
        this.logger.log(
          `Employee movement type already exists: ${employeeMovementType}`,
        );
      }
    }
  }
}
