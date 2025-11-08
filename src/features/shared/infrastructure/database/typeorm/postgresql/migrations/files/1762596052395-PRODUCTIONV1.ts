import { MigrationInterface, QueryRunner } from "typeorm";

export class PRODUCTIONV11762596052395 implements MigrationInterface {
    name = 'PRODUCTIONV11762596052395'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "leaveyearconfiguration" (
                "id" SERIAL NOT NULL,
                "cutoffstartdate" date NOT NULL,
                "cutoffenddate" date NOT NULL,
                "year" character varying(20) NOT NULL,
                "remarks" text,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                "isactive" boolean NOT NULL DEFAULT true,
                CONSTRAINT "UQ_3bc66b1a039b191965c1702d83d" UNIQUE ("year"),
                CONSTRAINT "PK_4e01c02adb29c4e3216e011d8ad" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4f8ad33699b1de66545be95042" ON "leaveyearconfiguration" ("cutoffstartdate", "cutoffenddate")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c081258b509d0f6a2c236a2c32" ON "leaveyearconfiguration" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3bc66b1a039b191965c1702d83" ON "leaveyearconfiguration" ("year")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f7649e9663802318ff486dc69c"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_94d074e56144cc222f8c5ce2d3"
        `);
        await queryRunner.query(`
            ALTER TABLE "leavebalance" DROP COLUMN "year"
        `);
        await queryRunner.query(`
            ALTER TABLE "leavebalance"
            ADD "year" character varying(20) NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f7649e9663802318ff486dc69c" ON "leavebalance" ("leavetypeid", "year")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_94d074e56144cc222f8c5ce2d3" ON "leavebalance" ("employeeid", "year")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_94d074e56144cc222f8c5ce2d3"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f7649e9663802318ff486dc69c"
        `);
        await queryRunner.query(`
            ALTER TABLE "leavebalance" DROP COLUMN "year"
        `);
        await queryRunner.query(`
            ALTER TABLE "leavebalance"
            ADD "year" integer NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_94d074e56144cc222f8c5ce2d3" ON "leavebalance" ("employeeid", "year")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f7649e9663802318ff486dc69c" ON "leavebalance" ("leavetypeid", "year")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3bc66b1a039b191965c1702d83"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c081258b509d0f6a2c236a2c32"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4f8ad33699b1de66545be95042"
        `);
        await queryRunner.query(`
            DROP TABLE "leaveyearconfiguration"
        `);
    }

}
