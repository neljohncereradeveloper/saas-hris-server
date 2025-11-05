import { MigrationInterface, QueryRunner } from "typeorm";

export class PRODUCTIONV11762355382298 implements MigrationInterface {
    name = 'PRODUCTIONV11762355382298'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_eb3aead4310a8fb9fa8e14ca60"
        `);
        await queryRunner.query(`
            ALTER TABLE "leavepolicy"
            ALTER COLUMN "effectivedate" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "leavepolicy"
            ALTER COLUMN "expirydate" DROP NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_eb3aead4310a8fb9fa8e14ca60" ON "leavepolicy" ("leavetypeid", "effectivedate")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_eb3aead4310a8fb9fa8e14ca60"
        `);
        await queryRunner.query(`
            ALTER TABLE "leavepolicy"
            ALTER COLUMN "expirydate"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "leavepolicy"
            ALTER COLUMN "effectivedate"
            SET NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_eb3aead4310a8fb9fa8e14ca60" ON "leavepolicy" ("effectivedate", "leavetypeid")
        `);
    }

}
