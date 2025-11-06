import { MigrationInterface, QueryRunner } from "typeorm";

export class PRODUCTIONV11762438341087 implements MigrationInterface {
    name = 'PRODUCTIONV11762438341087'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_eb3aead4310a8fb9fa8e14ca60"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_eb3aead4310a8fb9fa8e14ca60" ON "leavepolicy" ("leavetypeid", "effectivedate")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_eb3aead4310a8fb9fa8e14ca60"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_eb3aead4310a8fb9fa8e14ca60" ON "leavepolicy" ("effectivedate", "leavetypeid")
        `);
    }

}
