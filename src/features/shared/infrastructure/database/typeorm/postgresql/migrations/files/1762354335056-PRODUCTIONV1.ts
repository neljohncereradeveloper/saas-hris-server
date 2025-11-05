import { MigrationInterface, QueryRunner } from "typeorm";

export class PRODUCTIONV11762354335056 implements MigrationInterface {
    name = 'PRODUCTIONV11762354335056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "leavetype" (
                "id" SERIAL NOT NULL,
                "name" character varying(100) NOT NULL,
                "code" character varying(20) NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "paid" boolean NOT NULL DEFAULT false,
                "remarks" text,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                "isactive" boolean NOT NULL DEFAULT true,
                CONSTRAINT "UQ_1745186b497f3819a67b18bd458" UNIQUE ("code"),
                CONSTRAINT "PK_bd24099dd56e20104396c5f233c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_43e2b75a873db605e2ba618504" ON "leavetype" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1745186b497f3819a67b18bd45" ON "leavetype" ("code")
        `);
        await queryRunner.query(`
            CREATE TABLE "leavepolicy" (
                "id" SERIAL NOT NULL,
                "leavetypeid" integer NOT NULL,
                "annualentitlement" numeric(5, 2) NOT NULL,
                "carrylimit" numeric(5, 2) NOT NULL,
                "encashlimit" numeric(5, 2) NOT NULL,
                "cyclelengthyears" integer NOT NULL,
                "effectivedate" date NOT NULL,
                "expirydate" date NOT NULL,
                "status" character varying(20) NOT NULL,
                "remarks" text,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                "isactive" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_da80cb115efc4c1ad82792e9408" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_336148fdc68937f6420ab2e3c8" ON "leavepolicy" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f58011ec6db5c6b432358290e5" ON "leavepolicy" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_eb3aead4310a8fb9fa8e14ca60" ON "leavepolicy" ("leavetypeid", "effectivedate")
        `);
        await queryRunner.query(`
            CREATE TABLE "leavebalance" (
                "id" SERIAL NOT NULL,
                "employeeid" integer NOT NULL,
                "leavetypeid" integer NOT NULL,
                "policyid" integer NOT NULL,
                "year" integer NOT NULL,
                "beginningbalance" numeric(5, 2) NOT NULL,
                "earned" numeric(5, 2) NOT NULL,
                "used" numeric(5, 2) NOT NULL,
                "carriedover" numeric(5, 2) NOT NULL,
                "encashed" numeric(5, 2) NOT NULL,
                "remaining" numeric(5, 2) NOT NULL,
                "lasttransactiondate" date,
                "status" character varying(20) NOT NULL,
                "remarks" text,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                "isactive" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_a8f15b27d0767f4eedf51a2fa78" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d1078e3dbaadc9acaf9a88961e" ON "leavebalance" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_43c34a27e5ea7e393bfc2d7783" ON "leavebalance" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f7649e9663802318ff486dc69c" ON "leavebalance" ("leavetypeid", "year")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_94d074e56144cc222f8c5ce2d3" ON "leavebalance" ("employeeid", "year")
        `);
        await queryRunner.query(`
            CREATE TABLE "leavecycle" (
                "id" SERIAL NOT NULL,
                "employeeid" integer NOT NULL,
                "leavetypeid" integer NOT NULL,
                "cyclestartyear" integer NOT NULL,
                "cycleendyear" integer NOT NULL,
                "totalcarried" numeric(5, 2) NOT NULL DEFAULT '0',
                "status" character varying(20) NOT NULL,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                "isactive" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_41c6a613af4b36cfdcf361e3d39" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_81ddf975f511d67d1049e81fd4" ON "leavecycle" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2b0e4e4de077cc3cc4fd204cfe" ON "leavecycle" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_024b8dfae001f0e5bc112cdcfe" ON "leavecycle" ("employeeid", "leavetypeid")
        `);
        await queryRunner.query(`
            CREATE TABLE "leaverequest" (
                "id" SERIAL NOT NULL,
                "employeeid" integer NOT NULL,
                "leavetypeid" integer NOT NULL,
                "startdate" date NOT NULL,
                "enddate" date NOT NULL,
                "totaldays" numeric(5, 2) NOT NULL,
                "reason" text,
                "balanceid" integer NOT NULL,
                "approvaldate" TIMESTAMP,
                "approvalby" integer,
                "remarks" text,
                "status" character varying(20) NOT NULL,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                "isactive" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_be4d4e005cd1502bf3e8407850b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_fa4a66b2bb5ad1aca64f594c78" ON "leaverequest" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_48f15957c6a923e1c44bd71e8f" ON "leaverequest" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a360806cbf91ce6767579600c0" ON "leaverequest" ("balanceid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a6dc920c7fb43cd3f42f22e2ff" ON "leaverequest" ("leavetypeid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b43455a8c0313273f05e56324d" ON "leaverequest" ("employeeid")
        `);
        await queryRunner.query(`
            CREATE TABLE "leavetransaction" (
                "id" SERIAL NOT NULL,
                "balanceid" integer NOT NULL,
                "transactiontype" character varying(20) NOT NULL,
                "days" numeric(5, 2) NOT NULL,
                "remarks" text,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                "isactive" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_2a130f04ab736e3925f7d8b90ab" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5e3ba88d1b4e0b38284d2a09a6" ON "leavetransaction" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1862b8656160e6909da49fe6b2" ON "leavetransaction" ("transactiontype")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_599fcef8997681b7d05afe0ab3" ON "leavetransaction" ("balanceid")
        `);
        await queryRunner.query(`
            ALTER TABLE "leavepolicy"
            ADD CONSTRAINT "FK_b3c139acb6122fb7aee7a3d93e9" FOREIGN KEY ("leavetypeid") REFERENCES "leavetype"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leavebalance"
            ADD CONSTRAINT "FK_c0a3403898966a94603ca77b616" FOREIGN KEY ("employeeid") REFERENCES "emp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leavebalance"
            ADD CONSTRAINT "FK_01146a72b265b2b0d7dd816bf5f" FOREIGN KEY ("leavetypeid") REFERENCES "leavetype"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leavebalance"
            ADD CONSTRAINT "FK_9c320645d69c2a1ce097a106e5c" FOREIGN KEY ("policyid") REFERENCES "leavepolicy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leavecycle"
            ADD CONSTRAINT "FK_9daf5615adeed5ffc5161e0ffb7" FOREIGN KEY ("employeeid") REFERENCES "emp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leavecycle"
            ADD CONSTRAINT "FK_55f40457051724ed24aac575516" FOREIGN KEY ("leavetypeid") REFERENCES "leavetype"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leaverequest"
            ADD CONSTRAINT "FK_b43455a8c0313273f05e56324df" FOREIGN KEY ("employeeid") REFERENCES "emp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leaverequest"
            ADD CONSTRAINT "FK_a6dc920c7fb43cd3f42f22e2ff0" FOREIGN KEY ("leavetypeid") REFERENCES "leavetype"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leaverequest"
            ADD CONSTRAINT "FK_a360806cbf91ce6767579600c0f" FOREIGN KEY ("balanceid") REFERENCES "leavebalance"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leavetransaction"
            ADD CONSTRAINT "FK_599fcef8997681b7d05afe0ab30" FOREIGN KEY ("balanceid") REFERENCES "leavebalance"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "leavetransaction" DROP CONSTRAINT "FK_599fcef8997681b7d05afe0ab30"
        `);
        await queryRunner.query(`
            ALTER TABLE "leaverequest" DROP CONSTRAINT "FK_a360806cbf91ce6767579600c0f"
        `);
        await queryRunner.query(`
            ALTER TABLE "leaverequest" DROP CONSTRAINT "FK_a6dc920c7fb43cd3f42f22e2ff0"
        `);
        await queryRunner.query(`
            ALTER TABLE "leaverequest" DROP CONSTRAINT "FK_b43455a8c0313273f05e56324df"
        `);
        await queryRunner.query(`
            ALTER TABLE "leavecycle" DROP CONSTRAINT "FK_55f40457051724ed24aac575516"
        `);
        await queryRunner.query(`
            ALTER TABLE "leavecycle" DROP CONSTRAINT "FK_9daf5615adeed5ffc5161e0ffb7"
        `);
        await queryRunner.query(`
            ALTER TABLE "leavebalance" DROP CONSTRAINT "FK_9c320645d69c2a1ce097a106e5c"
        `);
        await queryRunner.query(`
            ALTER TABLE "leavebalance" DROP CONSTRAINT "FK_01146a72b265b2b0d7dd816bf5f"
        `);
        await queryRunner.query(`
            ALTER TABLE "leavebalance" DROP CONSTRAINT "FK_c0a3403898966a94603ca77b616"
        `);
        await queryRunner.query(`
            ALTER TABLE "leavepolicy" DROP CONSTRAINT "FK_b3c139acb6122fb7aee7a3d93e9"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_599fcef8997681b7d05afe0ab3"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1862b8656160e6909da49fe6b2"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5e3ba88d1b4e0b38284d2a09a6"
        `);
        await queryRunner.query(`
            DROP TABLE "leavetransaction"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b43455a8c0313273f05e56324d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a6dc920c7fb43cd3f42f22e2ff"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a360806cbf91ce6767579600c0"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_48f15957c6a923e1c44bd71e8f"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_fa4a66b2bb5ad1aca64f594c78"
        `);
        await queryRunner.query(`
            DROP TABLE "leaverequest"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_024b8dfae001f0e5bc112cdcfe"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2b0e4e4de077cc3cc4fd204cfe"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_81ddf975f511d67d1049e81fd4"
        `);
        await queryRunner.query(`
            DROP TABLE "leavecycle"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_94d074e56144cc222f8c5ce2d3"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f7649e9663802318ff486dc69c"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_43c34a27e5ea7e393bfc2d7783"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d1078e3dbaadc9acaf9a88961e"
        `);
        await queryRunner.query(`
            DROP TABLE "leavebalance"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_eb3aead4310a8fb9fa8e14ca60"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f58011ec6db5c6b432358290e5"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_336148fdc68937f6420ab2e3c8"
        `);
        await queryRunner.query(`
            DROP TABLE "leavepolicy"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1745186b497f3819a67b18bd45"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_43e2b75a873db605e2ba618504"
        `);
        await queryRunner.query(`
            DROP TABLE "leavetype"
        `);
    }

}
