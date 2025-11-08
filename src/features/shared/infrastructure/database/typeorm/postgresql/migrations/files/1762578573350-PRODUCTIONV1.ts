import { MigrationInterface, QueryRunner } from "typeorm";

export class PRODUCTIONV11762578573350 implements MigrationInterface {
    name = 'PRODUCTIONV11762578573350'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "leavepolicy"
            ADD "minimumservicemonths" integer DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "leavepolicy"
            ADD "allowedemployeestatuses" text array
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "leavepolicy" DROP COLUMN "allowedemployeestatuses"
        `);
        await queryRunner.query(`
            ALTER TABLE "leavepolicy" DROP COLUMN "minimumservicemonths"
        `);
    }

}
