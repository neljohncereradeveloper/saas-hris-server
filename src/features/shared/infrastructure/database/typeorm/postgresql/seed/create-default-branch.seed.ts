import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { BranchEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/branch.entity';

export class SeedBranch {
  private readonly logger = new Logger(SeedBranch.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const branches = [{ brcode: 'df', desc1: 'default' }];

    for (const branchData of branches) {
      const existingBranch = await this.entityManager.findOne(BranchEntity, {
        where: { brcode: branchData.brcode },
      });

      if (!existingBranch) {
        const branch = this.entityManager.create(BranchEntity, {
          ...branchData,
          createdby: 'system',
          updatedby: 'system',
        });

        await this.entityManager.save(branch);
        this.logger.log(
          `Created branch: ${branchData.desc1} (${branchData.brcode})`,
        );
      } else {
        this.logger.log(
          `Branch already exists: ${branchData.desc1} (${branchData.brcode})`,
        );
      }
    }
  }
}
