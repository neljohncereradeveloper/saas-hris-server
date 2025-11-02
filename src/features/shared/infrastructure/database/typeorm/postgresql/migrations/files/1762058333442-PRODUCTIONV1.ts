import { MigrationInterface, QueryRunner } from "typeorm";

export class PRODUCTIONV11762058333442 implements MigrationInterface {
    name = 'PRODUCTIONV11762058333442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "citizenship" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_db0bdbc11d6e8e66f67a4550b8d" UNIQUE ("desc1"),
                CONSTRAINT "PK_14861bdc8463fecc684d3b55db8" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9f90f10de7b8864c82ff6ac271" ON "citizenship" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "branch" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "brcode" character varying(10) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_48062926a173618e711c9de972d" UNIQUE ("brcode", "desc1"),
                CONSTRAINT "PK_2e39f426e2faefdaa93c5961976" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8d2b55459a368aeb0988cb1ff9" ON "branch" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b89aab3a5368500381eba00864" ON "branch" ("brcode")
        `);
        await queryRunner.query(`
            CREATE TABLE "dept" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "code" character varying(20),
                "designation" character varying(255),
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_6360eeef18e5760fa431029c17e" UNIQUE ("desc1"),
                CONSTRAINT "PK_deff0441db275143073fd33362a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_98eec107cf183f5d2a140a36b0" ON "dept" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3e687e552df27bfb36b8d3ac2f" ON "dept" ("code")
        `);
        await queryRunner.query(`
            CREATE TABLE "jobtitle" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_393f0a09c01ce4aa9861b53a15c" UNIQUE ("desc1"),
                CONSTRAINT "PK_59b5572f30ce2447a6ed7e49312" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ad3b17ed837538694d4a160078" ON "jobtitle" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "empstatus" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_4a414db4e07470e094a34de2b49" UNIQUE ("desc1"),
                CONSTRAINT "PK_cee414355e4910218064dec8552" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d6091ac0ff1762bd36e2c500fe" ON "empstatus" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "religion" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_5a50abdaed8ccf22ab6fe39754b" UNIQUE ("desc1"),
                CONSTRAINT "PK_fcfc9cd803b178c11fd21285d30" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_dccad7fb377fff8aef798c4261" ON "religion" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "civilstatus" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_950d10e2841984505be553422a7" UNIQUE ("desc1"),
                CONSTRAINT "PK_c5e33f94410c4c5721df2e71f4f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a6b9e10ea50a82294a8869fa4e" ON "civilstatus" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "province" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_c2d34d7805a5f30558c0003fe24" UNIQUE ("desc1"),
                CONSTRAINT "PK_4f461cb46f57e806516b7073659" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bff851e3c006622e313846dbef" ON "province" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "barangay" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_bc11a4f7c969b0c0e17ae268cdb" UNIQUE ("desc1"),
                CONSTRAINT "PK_dc3bd8e6872a2b03589559dfc35" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_788688a34273360ee4064b7afb" ON "barangay" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "edu_course" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_8ff59196ab6be4f06dd56271175" UNIQUE ("desc1"),
                CONSTRAINT "PK_35485e20e47324f36199049e6bf" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_706c1b4234db636a5b38fd6710" ON "edu_course" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "edu_courselevel" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_f8875b207a27ff686bdd1866399" UNIQUE ("desc1"),
                CONSTRAINT "PK_34050b32d2b97f76aba1f26b9d0" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7ac327cca49c3cfa1cac9f8a63" ON "edu_courselevel" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "edu_level" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_9f11410a84787c9bc079aa38b3e" UNIQUE ("desc1"),
                CONSTRAINT "PK_04c57aeac0749276bea8fa7edbb" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e639c31f76d358bb14adfc909f" ON "edu_level" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "edu_school" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_0aa0459bd344d3ae6dcffaaa81d" UNIQUE ("desc1"),
                CONSTRAINT "PK_91d24bd82a1d1c8c5d0411d403e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_feb665bae1d62c394c0d5d5bbb" ON "edu_school" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "edu" (
                "id" SERIAL NOT NULL,
                "schoolyear" character varying(20) NOT NULL,
                "eduschooldid" integer NOT NULL,
                "edulevelid" integer NOT NULL,
                "educourseid" integer,
                "educourselevelid" integer,
                "employeeid" integer NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "PK_d5094e87f8977a01e6cc0d524ee" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_080d80ac454e1682831d1c16d5" ON "edu" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_193d9aafee734cb0b7dae66db1" ON "edu" ("employeeid")
        `);
        await queryRunner.query(`
            CREATE TABLE "training_cert" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_59be189c196018c37b96841fc0f" UNIQUE ("desc1"),
                CONSTRAINT "PK_eb15e03a7e8d19b57ea5b613019" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_77f8bd34549427cd5472f540f4" ON "training_cert" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "training" (
                "id" SERIAL NOT NULL,
                "trainingtitle" character varying(255),
                "desc1" character varying(500),
                "trainingdate" date NOT NULL,
                "trainingscertid" integer NOT NULL,
                "imagepath" character varying(500),
                "employeeid" integer NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "PK_c436c96be3adf1aa439ef471427" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e97ad5b156fc70f0182e5d9065" ON "training" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9e42ef8c6722be5597c6e689d7" ON "training" ("trainingscertid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_312b487249fbfb368e82d6679c" ON "training" ("employeeid")
        `);
        await queryRunner.query(`
            CREATE TABLE "reference" (
                "id" SERIAL NOT NULL,
                "fname" character varying(100) NOT NULL,
                "mname" character varying(100),
                "lname" character varying(100) NOT NULL,
                "suffix" character varying(20),
                "cellphonenumber" character varying(20),
                "employeeid" integer NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "PK_01bacbbdd90839b7dce352e4250" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_00b6f9a89c9a2bf6a975acefa2" ON "reference" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_eae7c6a77bd9cb9e54350f67ed" ON "reference" ("employeeid")
        `);
        await queryRunner.query(`
            CREATE TABLE "workexp_company" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_45101576508dee330c84baaa2a7" UNIQUE ("desc1"),
                CONSTRAINT "PK_a14adee876b85ab9cbb492692a1" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_01d71be261fe615f2505dc0cd9" ON "workexp_company" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "workexp_jobtitle" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_86937d442af1d1c83aa1b4315ee" UNIQUE ("desc1"),
                CONSTRAINT "PK_baa7e5a843b14e4b5ad433fa73b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8b79f5a3cb6e2e2ba857e9db7c" ON "workexp_jobtitle" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "workexp" (
                "id" SERIAL NOT NULL,
                "companyid" integer,
                "years" character varying(50),
                "workexpjobtitleid" integer,
                "employeeid" integer NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "PK_7fad3aceacb97e3fb4a4690f2e9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f3d63813e54af6d269b8bfac0c" ON "workexp" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_863c85c027cb6876c3d43dc683" ON "workexp" ("companyid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e9d32f8227dac4726ada01a897" ON "workexp" ("employeeid")
        `);
        await queryRunner.query(`
            CREATE TABLE "emp_movement_type" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_6dc2b7467ad58c55da8a448bbb5" UNIQUE ("desc1"),
                CONSTRAINT "PK_422c174ba61bf79ab7c60eccaed" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_75656114bacbe3ec6f297e6343" ON "emp_movement_type" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "emp_movement" (
                "id" SERIAL NOT NULL,
                "employeeid" integer NOT NULL,
                "employeemovementtypeid" integer NOT NULL,
                "effectivedate" date NOT NULL,
                "reason" text,
                "previousbranchid" integer,
                "previousdepartmentid" integer,
                "previousjobtitleid" integer,
                "previousannualsalary" numeric(10, 2),
                "previousmonthlysalary" numeric(10, 2),
                "newbranchid" integer,
                "newdepartmentid" integer,
                "newjobtitleid" integer,
                "newannualsalary" numeric(10, 2),
                "newmonthlysalary" numeric(10, 2),
                "approvedby" character varying(100),
                "approveddate" date,
                "notes" text,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                "isactive" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_242a5bfb976d03427a31d9ac7c4" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_60a9f4e5c5b188e645b7665396" ON "emp_movement" ("effectivedate")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f974c10798a9298f1772629477" ON "emp_movement" ("employeeid", "effectivedate")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."emp_gender_enum" AS ENUM('male', 'female')
        `);
        await queryRunner.query(`
            CREATE TABLE "emp" (
                "id" SERIAL NOT NULL,
                "jobtitleid" integer NOT NULL,
                "empstatusid" integer NOT NULL,
                "branchid" integer NOT NULL,
                "departmentid" integer NOT NULL,
                "hiredate" date NOT NULL,
                "enddate" date,
                "regularizationdate" date,
                "idnumber" character varying(100),
                "bionumber" character varying(100),
                "imagepath" character varying(500),
                "fname" character varying(100) NOT NULL,
                "lname" character varying(100) NOT NULL,
                "mname" character varying(100),
                "suffix" character varying(20),
                "birthdate" date NOT NULL,
                "religionid" integer NOT NULL,
                "civilstatusid" integer NOT NULL,
                "age" integer,
                "gender" "public"."emp_gender_enum",
                "citizenshipid" integer,
                "height" integer,
                "weight" integer,
                "homeaddressstreet" character varying(500) NOT NULL,
                "homeaddressbarangayid" integer,
                "homeaddresscityid" integer NOT NULL,
                "homeaddressprovinceid" integer,
                "homeaddresszipcode" character varying(20) NOT NULL,
                "presentaddressstreet" character varying(500),
                "presentaddressbarangayid" integer,
                "presentaddresscityid" integer,
                "presentaddressprovinceid" integer,
                "presentaddresszipcode" character varying(20),
                "email" character varying(255),
                "cellphonenumber" character varying(20),
                "telephonenumber" character varying(20),
                "emergencycontactname" character varying(255),
                "emergencycontactnumber" character varying(20),
                "emergencycontactrelationship" character varying(100),
                "emergencycontactaddress" character varying(500),
                "husbandorwifename" character varying(255),
                "husbandorwifebirthdate" date,
                "husbandorwifeoccupation" character varying(255),
                "numberofchildren" integer,
                "fathersname" character varying(255),
                "fathersbirthdate" date,
                "fathersoccupation" character varying(255),
                "mothersname" character varying(255),
                "mothersbirthdate" date,
                "mothersoccupation" character varying(255),
                "bankaccountnumber" character varying(255),
                "bankaccountname" character varying(255),
                "bankname" character varying(255),
                "bankbranch" character varying(255),
                "annualsalary" numeric(10, 2) NOT NULL DEFAULT '0',
                "monthlysalary" numeric(10, 2) NOT NULL DEFAULT '0',
                "dailyrate" numeric(10, 2) NOT NULL DEFAULT '0',
                "hourlyrate" numeric(10, 2) NOT NULL DEFAULT '0',
                "phic" character varying(255),
                "hdmf" character varying(255),
                "sssno" character varying(255),
                "tinno" character varying(255),
                "taxexemptcode" character varying(255),
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_356fcdb502dd97eb4d96d083e39" UNIQUE ("idnumber"),
                CONSTRAINT "UQ_299e829924775cbd9ece4d4b404" UNIQUE ("bionumber"),
                CONSTRAINT "PK_1b045fdda4e4ea45029273c1b9a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f40a313f5fd0f0f096b278c498" ON "emp" ("email")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_299e829924775cbd9ece4d4b40" ON "emp" ("bionumber")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_356fcdb502dd97eb4d96d083e3" ON "emp" ("idnumber")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b5cadbedce908eeb144ab5b499" ON "emp" ("fname", "mname", "lname", "idnumber")
        `);
        await queryRunner.query(`
            CREATE TABLE "city" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "isactive" boolean NOT NULL DEFAULT true,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                CONSTRAINT "UQ_6469ef18fac032c5f19b347e68d" UNIQUE ("desc1"),
                CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_08ad59b4c8a870120253c3e55f" ON "city" ("isactive")
        `);
        await queryRunner.query(`
            CREATE TABLE "activitylog" (
                "id" SERIAL NOT NULL,
                "action" character varying(50) NOT NULL,
                "entity" character varying(50) NOT NULL,
                "details" text,
                "metadata" text,
                "ipaddress" character varying(45),
                "useragent" character varying(500),
                "sessionid" character varying(100),
                "userid" character varying(100) NOT NULL,
                "username" character varying(100),
                "description" character varying(255),
                "issuccess" boolean NOT NULL DEFAULT true,
                "errormessage" character varying(500),
                "statuscode" integer,
                "duration" integer,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100) NOT NULL DEFAULT 'system',
                CONSTRAINT "PK_45ea5194b66252c991f4f0794be" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "activitylog"."action" IS 'Type of action performed (from CONSTANTS_LOG_ACTION)';
            COMMENT ON COLUMN "activitylog"."details" IS 'JSON string containing activity details';
            COMMENT ON COLUMN "activitylog"."metadata" IS 'Additional metadata';
            COMMENT ON COLUMN "activitylog"."ipaddress" IS 'IP address of the user';
            COMMENT ON COLUMN "activitylog"."useragent" IS 'User agent string';
            COMMENT ON COLUMN "activitylog"."sessionid" IS 'Session ID';
            COMMENT ON COLUMN "activitylog"."userid" IS 'ID of the user who performed the action';
            COMMENT ON COLUMN "activitylog"."username" IS 'Username for display purposes';
            COMMENT ON COLUMN "activitylog"."description" IS 'Description of the action';
            COMMENT ON COLUMN "activitylog"."issuccess" IS 'Whether the action was successful';
            COMMENT ON COLUMN "activitylog"."errormessage" IS 'Error message if action failed';
            COMMENT ON COLUMN "activitylog"."statuscode" IS 'HTTP status code';
            COMMENT ON COLUMN "activitylog"."duration" IS 'Duration of the action in milliseconds';
            COMMENT ON COLUMN "activitylog"."createdat" IS 'When the activity was created';
            COMMENT ON COLUMN "activitylog"."createdby" IS 'Who created this record'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_53fd11d7949aaac5156c2ce192" ON "activitylog" ("createdat")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f246f1eae1e89e06edc4b69a86" ON "activitylog" ("action", "createdat")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cc0dda5f8e09bedfe1ea996c6e" ON "activitylog" ("entity", "createdat")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ceb11ad91f0f727f71d0a15490" ON "activitylog" ("userid", "createdat")
        `);
        await queryRunner.query(`
            CREATE TABLE "leave_type" (
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
                CONSTRAINT "UQ_15cccf623fb57c4d4497a29549c" UNIQUE ("code"),
                CONSTRAINT "PK_dea42866b70af67caabf936f496" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_95acf0e902a7ff4a06902ed028" ON "leave_type" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_15cccf623fb57c4d4497a29549" ON "leave_type" ("code")
        `);
        await queryRunner.query(`
            CREATE TABLE "leave_policy" (
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
                CONSTRAINT "PK_9d7812f2a0669f44dcf8ef62c20" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_23d33ab5d351f23bc36e94aa68" ON "leave_policy" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2cc00c9ea7179c2bad43ade933" ON "leave_policy" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c525878fdcc0284063d2142728" ON "leave_policy" ("leavetypeid", "effectivedate")
        `);
        await queryRunner.query(`
            CREATE TABLE "leave_balance" (
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
                CONSTRAINT "PK_3455e264c75148742540634aca2" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2f008ea80debb29f958dc49fa2" ON "leave_balance" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a4b1c40cfa10b729dfe692debd" ON "leave_balance" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c7d93fa7642811b5e54ce14e42" ON "leave_balance" ("leavetypeid", "year")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b2628ad6ce68ac26b717ef1cd8" ON "leave_balance" ("employeeid", "year")
        `);
        await queryRunner.query(`
            CREATE TABLE "leave_cycle" (
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
                CONSTRAINT "PK_20325087241f8f8d76e6d36aabc" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e15ccc35cd4971c7bba70ec574" ON "leave_cycle" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9c6e7ece3ee8f6542597747a82" ON "leave_cycle" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4c53896134d47f7214269c728e" ON "leave_cycle" ("employeeid", "leavetypeid")
        `);
        await queryRunner.query(`
            CREATE TABLE "leave_request" (
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
                CONSTRAINT "PK_6f6ed3822203a4e10a5753368db" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_df3b6736f0d939458fff5e6b56" ON "leave_request" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4ee8adc97f34bfa2b4bda14f21" ON "leave_request" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_28683c196b08282f9d0c3217f4" ON "leave_request" ("balanceid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_73c953be69994094a27cfd7125" ON "leave_request" ("leavetypeid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e55d3c88eef48a854cfe9547f7" ON "leave_request" ("employeeid")
        `);
        await queryRunner.query(`
            CREATE TABLE "leave_transaction" (
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
                CONSTRAINT "PK_68209d607711506ecdeb3ee415f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c76447007f86f10a9343b4b56e" ON "leave_transaction" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_823f03396f9512e334874ba451" ON "leave_transaction" ("transactiontype")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1a04cbb2939be1f22569152576" ON "leave_transaction" ("balanceid")
        `);
        await queryRunner.query(`
            CREATE TABLE "holiday" (
                "id" SERIAL NOT NULL,
                "name" character varying(100) NOT NULL,
                "date" date NOT NULL,
                "description" text,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                "createdby" character varying(100),
                "updatedby" character varying(100),
                "isactive" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_3e7492c25f80418a7aad0aec053" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_97b7dca29e1cef2ac94460ca57" ON "holiday" ("isactive")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_89b26e4ed3db8895b86c8df55e" ON "holiday" ("date")
        `);
        await queryRunner.query(`
            ALTER TABLE "edu"
            ADD CONSTRAINT "FK_48de354faf154a375983d453657" FOREIGN KEY ("educourseid") REFERENCES "edu_course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "edu"
            ADD CONSTRAINT "FK_88bcb9197db3b735044671bc91d" FOREIGN KEY ("educourselevelid") REFERENCES "edu_courselevel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "edu"
            ADD CONSTRAINT "FK_8304d2d7996946ea671dd204fbb" FOREIGN KEY ("edulevelid") REFERENCES "edu_level"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "edu"
            ADD CONSTRAINT "FK_10b2373dfa212d146acdfbfbbf6" FOREIGN KEY ("eduschooldid") REFERENCES "edu_school"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "edu"
            ADD CONSTRAINT "FK_193d9aafee734cb0b7dae66db1c" FOREIGN KEY ("employeeid") REFERENCES "emp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "training"
            ADD CONSTRAINT "FK_9e42ef8c6722be5597c6e689d76" FOREIGN KEY ("trainingscertid") REFERENCES "training_cert"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "training"
            ADD CONSTRAINT "FK_312b487249fbfb368e82d6679c0" FOREIGN KEY ("employeeid") REFERENCES "emp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "reference"
            ADD CONSTRAINT "FK_eae7c6a77bd9cb9e54350f67ed9" FOREIGN KEY ("employeeid") REFERENCES "emp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "workexp"
            ADD CONSTRAINT "FK_e9d32f8227dac4726ada01a897d" FOREIGN KEY ("employeeid") REFERENCES "emp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "workexp"
            ADD CONSTRAINT "FK_dcaedb4971bb707cbbe5a6fbfee" FOREIGN KEY ("workexpjobtitleid") REFERENCES "workexp_jobtitle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "workexp"
            ADD CONSTRAINT "FK_863c85c027cb6876c3d43dc6832" FOREIGN KEY ("companyid") REFERENCES "workexp_company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement"
            ADD CONSTRAINT "FK_c9c3ccedacf9c5b468a73ac1f69" FOREIGN KEY ("employeeid") REFERENCES "emp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement"
            ADD CONSTRAINT "FK_50868bb04f80b664a0f17f83472" FOREIGN KEY ("previousbranchid") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement"
            ADD CONSTRAINT "FK_8770180adc07f8c4f1902ef75b4" FOREIGN KEY ("newbranchid") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement"
            ADD CONSTRAINT "FK_5eb472e38236b48b40fdf6ecd73" FOREIGN KEY ("previousdepartmentid") REFERENCES "dept"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement"
            ADD CONSTRAINT "FK_44a9e0556c26bc8f6767c146172" FOREIGN KEY ("newdepartmentid") REFERENCES "dept"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement"
            ADD CONSTRAINT "FK_6b1324d3e2e54560f2c9fe95ac2" FOREIGN KEY ("previousjobtitleid") REFERENCES "jobtitle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement"
            ADD CONSTRAINT "FK_c332fb2055fea4c61c4ec518a1a" FOREIGN KEY ("newjobtitleid") REFERENCES "jobtitle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement"
            ADD CONSTRAINT "FK_ed01a819ba40bb44ee79641e9cd" FOREIGN KEY ("employeemovementtypeid") REFERENCES "emp_movement_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp"
            ADD CONSTRAINT "FK_84f468eb8728bafff9a6131e411" FOREIGN KEY ("branchid") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp"
            ADD CONSTRAINT "FK_cd26df77aaad22e9b15eb13471d" FOREIGN KEY ("departmentid") REFERENCES "dept"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp"
            ADD CONSTRAINT "FK_e360b36e0b71d052889da879c8a" FOREIGN KEY ("jobtitleid") REFERENCES "jobtitle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp"
            ADD CONSTRAINT "FK_55cbada3b0f704ad68af9a67af5" FOREIGN KEY ("empstatusid") REFERENCES "empstatus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp"
            ADD CONSTRAINT "FK_5ecbf74e6f2a2325a8108833853" FOREIGN KEY ("religionid") REFERENCES "religion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp"
            ADD CONSTRAINT "FK_659f38f89d0e9f8038e13dd4ac0" FOREIGN KEY ("citizenshipid") REFERENCES "citizenship"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp"
            ADD CONSTRAINT "FK_94e0b737821e44c90ae8b7b92b1" FOREIGN KEY ("civilstatusid") REFERENCES "civilstatus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp"
            ADD CONSTRAINT "FK_814692e71e1e6202c8859dd5e32" FOREIGN KEY ("homeaddressbarangayid") REFERENCES "barangay"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp"
            ADD CONSTRAINT "FK_13e2868ca546d3cde2fb2cf0f1d" FOREIGN KEY ("homeaddresscityid") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp"
            ADD CONSTRAINT "FK_b0ed2a8fa50e8d072605dfb623d" FOREIGN KEY ("homeaddressprovinceid") REFERENCES "province"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp"
            ADD CONSTRAINT "FK_37c1179f417664d7f8ff7c44a0d" FOREIGN KEY ("presentaddressbarangayid") REFERENCES "barangay"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp"
            ADD CONSTRAINT "FK_46eedaa5463d7864fce7258707a" FOREIGN KEY ("presentaddresscityid") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emp"
            ADD CONSTRAINT "FK_05535d65227c030cc13f63e10e9" FOREIGN KEY ("presentaddressprovinceid") REFERENCES "province"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_policy"
            ADD CONSTRAINT "FK_043a755eabe37eee0d250364763" FOREIGN KEY ("leavetypeid") REFERENCES "leave_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_balance"
            ADD CONSTRAINT "FK_366ddeccf4731ab0fcd0b373d83" FOREIGN KEY ("employeeid") REFERENCES "emp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_balance"
            ADD CONSTRAINT "FK_8dbacaa817c2dd3f2894e8ba425" FOREIGN KEY ("leavetypeid") REFERENCES "leave_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_balance"
            ADD CONSTRAINT "FK_18e8a1c5f7b53b4354d5e5a881f" FOREIGN KEY ("policyid") REFERENCES "leave_policy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_cycle"
            ADD CONSTRAINT "FK_0bb28d0c206b5bb74697365a014" FOREIGN KEY ("employeeid") REFERENCES "emp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_cycle"
            ADD CONSTRAINT "FK_2222e62c0d89778d7e932beab9c" FOREIGN KEY ("leavetypeid") REFERENCES "leave_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_request"
            ADD CONSTRAINT "FK_e55d3c88eef48a854cfe9547f7c" FOREIGN KEY ("employeeid") REFERENCES "emp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_request"
            ADD CONSTRAINT "FK_73c953be69994094a27cfd71251" FOREIGN KEY ("leavetypeid") REFERENCES "leave_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_request"
            ADD CONSTRAINT "FK_28683c196b08282f9d0c3217f4e" FOREIGN KEY ("balanceid") REFERENCES "leave_balance"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_transaction"
            ADD CONSTRAINT "FK_1a04cbb2939be1f22569152576f" FOREIGN KEY ("balanceid") REFERENCES "leave_balance"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "leave_transaction" DROP CONSTRAINT "FK_1a04cbb2939be1f22569152576f"
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_request" DROP CONSTRAINT "FK_28683c196b08282f9d0c3217f4e"
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_request" DROP CONSTRAINT "FK_73c953be69994094a27cfd71251"
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_request" DROP CONSTRAINT "FK_e55d3c88eef48a854cfe9547f7c"
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_cycle" DROP CONSTRAINT "FK_2222e62c0d89778d7e932beab9c"
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_cycle" DROP CONSTRAINT "FK_0bb28d0c206b5bb74697365a014"
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_balance" DROP CONSTRAINT "FK_18e8a1c5f7b53b4354d5e5a881f"
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_balance" DROP CONSTRAINT "FK_8dbacaa817c2dd3f2894e8ba425"
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_balance" DROP CONSTRAINT "FK_366ddeccf4731ab0fcd0b373d83"
        `);
        await queryRunner.query(`
            ALTER TABLE "leave_policy" DROP CONSTRAINT "FK_043a755eabe37eee0d250364763"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp" DROP CONSTRAINT "FK_05535d65227c030cc13f63e10e9"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp" DROP CONSTRAINT "FK_46eedaa5463d7864fce7258707a"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp" DROP CONSTRAINT "FK_37c1179f417664d7f8ff7c44a0d"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp" DROP CONSTRAINT "FK_b0ed2a8fa50e8d072605dfb623d"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp" DROP CONSTRAINT "FK_13e2868ca546d3cde2fb2cf0f1d"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp" DROP CONSTRAINT "FK_814692e71e1e6202c8859dd5e32"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp" DROP CONSTRAINT "FK_94e0b737821e44c90ae8b7b92b1"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp" DROP CONSTRAINT "FK_659f38f89d0e9f8038e13dd4ac0"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp" DROP CONSTRAINT "FK_5ecbf74e6f2a2325a8108833853"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp" DROP CONSTRAINT "FK_55cbada3b0f704ad68af9a67af5"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp" DROP CONSTRAINT "FK_e360b36e0b71d052889da879c8a"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp" DROP CONSTRAINT "FK_cd26df77aaad22e9b15eb13471d"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp" DROP CONSTRAINT "FK_84f468eb8728bafff9a6131e411"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement" DROP CONSTRAINT "FK_ed01a819ba40bb44ee79641e9cd"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement" DROP CONSTRAINT "FK_c332fb2055fea4c61c4ec518a1a"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement" DROP CONSTRAINT "FK_6b1324d3e2e54560f2c9fe95ac2"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement" DROP CONSTRAINT "FK_44a9e0556c26bc8f6767c146172"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement" DROP CONSTRAINT "FK_5eb472e38236b48b40fdf6ecd73"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement" DROP CONSTRAINT "FK_8770180adc07f8c4f1902ef75b4"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement" DROP CONSTRAINT "FK_50868bb04f80b664a0f17f83472"
        `);
        await queryRunner.query(`
            ALTER TABLE "emp_movement" DROP CONSTRAINT "FK_c9c3ccedacf9c5b468a73ac1f69"
        `);
        await queryRunner.query(`
            ALTER TABLE "workexp" DROP CONSTRAINT "FK_863c85c027cb6876c3d43dc6832"
        `);
        await queryRunner.query(`
            ALTER TABLE "workexp" DROP CONSTRAINT "FK_dcaedb4971bb707cbbe5a6fbfee"
        `);
        await queryRunner.query(`
            ALTER TABLE "workexp" DROP CONSTRAINT "FK_e9d32f8227dac4726ada01a897d"
        `);
        await queryRunner.query(`
            ALTER TABLE "reference" DROP CONSTRAINT "FK_eae7c6a77bd9cb9e54350f67ed9"
        `);
        await queryRunner.query(`
            ALTER TABLE "training" DROP CONSTRAINT "FK_312b487249fbfb368e82d6679c0"
        `);
        await queryRunner.query(`
            ALTER TABLE "training" DROP CONSTRAINT "FK_9e42ef8c6722be5597c6e689d76"
        `);
        await queryRunner.query(`
            ALTER TABLE "edu" DROP CONSTRAINT "FK_193d9aafee734cb0b7dae66db1c"
        `);
        await queryRunner.query(`
            ALTER TABLE "edu" DROP CONSTRAINT "FK_10b2373dfa212d146acdfbfbbf6"
        `);
        await queryRunner.query(`
            ALTER TABLE "edu" DROP CONSTRAINT "FK_8304d2d7996946ea671dd204fbb"
        `);
        await queryRunner.query(`
            ALTER TABLE "edu" DROP CONSTRAINT "FK_88bcb9197db3b735044671bc91d"
        `);
        await queryRunner.query(`
            ALTER TABLE "edu" DROP CONSTRAINT "FK_48de354faf154a375983d453657"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_89b26e4ed3db8895b86c8df55e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_97b7dca29e1cef2ac94460ca57"
        `);
        await queryRunner.query(`
            DROP TABLE "holiday"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1a04cbb2939be1f22569152576"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_823f03396f9512e334874ba451"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c76447007f86f10a9343b4b56e"
        `);
        await queryRunner.query(`
            DROP TABLE "leave_transaction"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e55d3c88eef48a854cfe9547f7"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_73c953be69994094a27cfd7125"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_28683c196b08282f9d0c3217f4"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4ee8adc97f34bfa2b4bda14f21"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_df3b6736f0d939458fff5e6b56"
        `);
        await queryRunner.query(`
            DROP TABLE "leave_request"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4c53896134d47f7214269c728e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9c6e7ece3ee8f6542597747a82"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e15ccc35cd4971c7bba70ec574"
        `);
        await queryRunner.query(`
            DROP TABLE "leave_cycle"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b2628ad6ce68ac26b717ef1cd8"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c7d93fa7642811b5e54ce14e42"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a4b1c40cfa10b729dfe692debd"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2f008ea80debb29f958dc49fa2"
        `);
        await queryRunner.query(`
            DROP TABLE "leave_balance"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c525878fdcc0284063d2142728"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2cc00c9ea7179c2bad43ade933"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_23d33ab5d351f23bc36e94aa68"
        `);
        await queryRunner.query(`
            DROP TABLE "leave_policy"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_15cccf623fb57c4d4497a29549"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_95acf0e902a7ff4a06902ed028"
        `);
        await queryRunner.query(`
            DROP TABLE "leave_type"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ceb11ad91f0f727f71d0a15490"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cc0dda5f8e09bedfe1ea996c6e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f246f1eae1e89e06edc4b69a86"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_53fd11d7949aaac5156c2ce192"
        `);
        await queryRunner.query(`
            DROP TABLE "activitylog"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_08ad59b4c8a870120253c3e55f"
        `);
        await queryRunner.query(`
            DROP TABLE "city"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b5cadbedce908eeb144ab5b499"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_356fcdb502dd97eb4d96d083e3"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_299e829924775cbd9ece4d4b40"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f40a313f5fd0f0f096b278c498"
        `);
        await queryRunner.query(`
            DROP TABLE "emp"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."emp_gender_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f974c10798a9298f1772629477"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_60a9f4e5c5b188e645b7665396"
        `);
        await queryRunner.query(`
            DROP TABLE "emp_movement"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_75656114bacbe3ec6f297e6343"
        `);
        await queryRunner.query(`
            DROP TABLE "emp_movement_type"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e9d32f8227dac4726ada01a897"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_863c85c027cb6876c3d43dc683"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f3d63813e54af6d269b8bfac0c"
        `);
        await queryRunner.query(`
            DROP TABLE "workexp"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8b79f5a3cb6e2e2ba857e9db7c"
        `);
        await queryRunner.query(`
            DROP TABLE "workexp_jobtitle"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_01d71be261fe615f2505dc0cd9"
        `);
        await queryRunner.query(`
            DROP TABLE "workexp_company"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_eae7c6a77bd9cb9e54350f67ed"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_00b6f9a89c9a2bf6a975acefa2"
        `);
        await queryRunner.query(`
            DROP TABLE "reference"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_312b487249fbfb368e82d6679c"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9e42ef8c6722be5597c6e689d7"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e97ad5b156fc70f0182e5d9065"
        `);
        await queryRunner.query(`
            DROP TABLE "training"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_77f8bd34549427cd5472f540f4"
        `);
        await queryRunner.query(`
            DROP TABLE "training_cert"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_193d9aafee734cb0b7dae66db1"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_080d80ac454e1682831d1c16d5"
        `);
        await queryRunner.query(`
            DROP TABLE "edu"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_feb665bae1d62c394c0d5d5bbb"
        `);
        await queryRunner.query(`
            DROP TABLE "edu_school"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e639c31f76d358bb14adfc909f"
        `);
        await queryRunner.query(`
            DROP TABLE "edu_level"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7ac327cca49c3cfa1cac9f8a63"
        `);
        await queryRunner.query(`
            DROP TABLE "edu_courselevel"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_706c1b4234db636a5b38fd6710"
        `);
        await queryRunner.query(`
            DROP TABLE "edu_course"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_788688a34273360ee4064b7afb"
        `);
        await queryRunner.query(`
            DROP TABLE "barangay"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_bff851e3c006622e313846dbef"
        `);
        await queryRunner.query(`
            DROP TABLE "province"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a6b9e10ea50a82294a8869fa4e"
        `);
        await queryRunner.query(`
            DROP TABLE "civilstatus"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_dccad7fb377fff8aef798c4261"
        `);
        await queryRunner.query(`
            DROP TABLE "religion"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d6091ac0ff1762bd36e2c500fe"
        `);
        await queryRunner.query(`
            DROP TABLE "empstatus"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ad3b17ed837538694d4a160078"
        `);
        await queryRunner.query(`
            DROP TABLE "jobtitle"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3e687e552df27bfb36b8d3ac2f"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_98eec107cf183f5d2a140a36b0"
        `);
        await queryRunner.query(`
            DROP TABLE "dept"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b89aab3a5368500381eba00864"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8d2b55459a368aeb0988cb1ff9"
        `);
        await queryRunner.query(`
            DROP TABLE "branch"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9f90f10de7b8864c82ff6ac271"
        `);
        await queryRunner.query(`
            DROP TABLE "citizenship"
        `);
    }

}
