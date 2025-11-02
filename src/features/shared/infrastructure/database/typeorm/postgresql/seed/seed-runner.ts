import { DataSource } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { Logger } from '@nestjs/common';
import { SeedBarangay } from './create-default-barangay.seed';
import { SeedBranch } from './create-default-branch.seed';
import { SeedCitizenship } from './create-default-citizenship.seed';
import { SeedCivilStatus } from './create-default-civilstatus.seed';
import { SeedDepartment } from './create-default-department.seed';
import { SeedEduCourse } from './create-default-educourse.seed';
import { SeedEduCourseLevel } from './create-default-educourselevel.seed';
import { SeedEduLevel } from './create-default-edulevel.seed';
import { SeedEduSchool } from './create-default-eduschool.seed';
import { SeedEmpStatus } from './create-default-empstatus.seed';
import { SeedJobTitle } from './create-default-jobtitle.seed';
import { SeedProvince } from './create-default-province.seed';
import { SeedReligion } from './create-default-religion.seed';
import { ActivityLogEntity } from '../entities/activity-log.entity';
import { BarangayEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/barangay.entity';
import { BranchEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/branch.entity';
import { CitizenShipEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/citizenship.entity';
import { CivilStatusEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/civilstatus.entity';
import { DeptEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/dept.entity';
import { CityEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/city.entity';
import { EduCourseEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-course.entity';
import { EduCourseLevelEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-courselevel.entity';
import { EduLevelEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-level.entity';
import { EduEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu';
import { EmpStatusEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/empstatus.entity';
import { EduSchoolEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-school.entity';
import { JobTitleEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/jobtitle.entity';
import { ReferenceEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/reference.entity';
import { ProvinceEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/province.entity';
import { ReligionEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/religion.entity';
import { TrainingCertEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/training-cert.entity';
import { TrainingEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/training.entity';
import { WorkExpCompanyEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/workexp-company.entity';
import { WorkExpJobTitleEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/workexp-jobtitle.entity';
import { WorkExpEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/workexp.entity';
import { EmployeeEntity } from '../entities/employee.entity';
import { EmployeeMovementEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/employee-movement.entity';
import { EmployeeMovementTypeEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/employee-movement-type.entity';
import { HolidayEntity } from '../entities/holiday.entity';
import { LeaveTypeEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-type.entity';
import { LeavePolicyEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-policy.entity';
import { LeaveBalanceEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-balance.entity';
import { LeaveCycleEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-cycle.entity';
import { LeaveRequestEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-request.entity';
import { LeaveTransactionEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-transaction.entity';
import { SeedHoliday } from './create-default-holiday.seed';
import { SeedCity } from './create-default-city.seed';
import { SeedWorkExpCompany } from './create-default-workexp-company.seed';
import { SeedWorkExpJobTitle } from './create-default-workexp-jobtitle.seed';
import { SeedEmployeeMovementType } from './create-default-employee-movement-type.seed';

// Load environment variables from .env
dotenvConfig();

// Define the standalone DataSource configuration
const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DB_URL,
  // host: process.env.DB_HOST || 'localhost',
  // port: Number(process.env.DB_PORT) || 5432,
  // username: process.env.DB_USERNAME || 'postgres',
  // password: process.env.DB_PASSWORD || 'postgres',
  // database: process.env.DB_DATABASE || 'hris',
  entities: [
    ActivityLogEntity,
    BarangayEntity,
    BranchEntity,
    CitizenShipEntity,
    CityEntity,
    CivilStatusEntity,
    DeptEntity,
    EduCourseEntity,
    EduCourseLevelEntity,
    EduLevelEntity,
    EduSchoolEntity,
    EduEntity,
    EmpStatusEntity,
    JobTitleEntity,
    ProvinceEntity,
    ReferenceEntity,
    ReligionEntity,
    TrainingCertEntity,
    TrainingEntity,
    WorkExpCompanyEntity,
    WorkExpJobTitleEntity,
    WorkExpEntity,
    EmployeeEntity,
    /** employee-movement */
    EmployeeMovementEntity,
    EmployeeMovementTypeEntity,
    /** leave-management */
    LeaveTypeEntity,
    LeavePolicyEntity,
    LeaveBalanceEntity,
    LeaveCycleEntity,
    LeaveRequestEntity,
    LeaveTransactionEntity,
    /** shared-features */
    HolidayEntity,
  ], // Adjust path to your compiled entities
  synchronize: false, // Avoid sync in production
  logging: process.env.DB_LOGGING === 'true',
});

class SeedRunner {
  private readonly logger = new Logger('SeedRunner');

  constructor(private readonly dataSource: DataSource) {}

  async run() {
    // Initialize database connection
    await this.dataSource.initialize();
    this.logger.debug('Seeder Database connected successfully.');

    // Start a query runner for manual transaction control
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Execute all seeds within the transaction
      const barangaySeeder = new SeedBarangay(queryRunner.manager);
      const branchSeeder = new SeedBranch(queryRunner.manager);
      const citizenshipSeeder = new SeedCitizenship(queryRunner.manager);
      const citySeeder = new SeedCity(queryRunner.manager);
      const civilStatusSeeder = new SeedCivilStatus(queryRunner.manager);
      const departmentSeeder = new SeedDepartment(queryRunner.manager);
      const eduCourseSeeder = new SeedEduCourse(queryRunner.manager);
      const eduCourseLevelSeeder = new SeedEduCourseLevel(queryRunner.manager);
      const eduLevelSeeder = new SeedEduLevel(queryRunner.manager);
      const eduSchoolSeeder = new SeedEduSchool(queryRunner.manager);
      const employeeMovementTypeSeeder = new SeedEmployeeMovementType(
        queryRunner.manager,
      );
      const empStatusSeeder = new SeedEmpStatus(queryRunner.manager);
      const holidaySeeder = new SeedHoliday(queryRunner.manager);
      const jobTitleSeeder = new SeedJobTitle(queryRunner.manager);
      const provinceSeeder = new SeedProvince(queryRunner.manager);
      const religionSeeder = new SeedReligion(queryRunner.manager);
      const workExpCompanySeeder = new SeedWorkExpCompany(queryRunner.manager);
      const workExpJobTitleSeeder = new SeedWorkExpJobTitle(
        queryRunner.manager,
      );

      await barangaySeeder.run();
      console.log('Barangay Seeded');
      await branchSeeder.run();
      console.log('Branch Seeded');
      await citizenshipSeeder.run();
      console.log('Citizenship Seeded');
      await citySeeder.run();
      console.log('City Seeded');
      await civilStatusSeeder.run();
      console.log('Civil Status Seeded');
      await departmentSeeder.run();
      console.log('Department Seeded');
      await eduCourseSeeder.run();
      console.log('Education Course Seeded');
      await eduCourseLevelSeeder.run();
      console.log('Education Course Level Seeded');
      await eduLevelSeeder.run();
      console.log('Education Level Seeded');
      await eduSchoolSeeder.run();
      console.log('Education School Seeded');
      await employeeMovementTypeSeeder.run();
      console.log('Employee Movement Type Seeded');
      await empStatusSeeder.run();
      console.log('Employee Status Seeded');
      await holidaySeeder.run();
      console.log('Holiday Seeded');
      await jobTitleSeeder.run();
      console.log('Job Title Seeded');
      await provinceSeeder.run();
      console.log('Province Seeded');
      await religionSeeder.run();
      console.log('Religion Seeded');
      await workExpCompanySeeder.run();
      console.log('Work Exp Company Seeded');
      await workExpJobTitleSeeder.run();
      console.log('Work Exp Job Title Seeded');

      // Commit the transaction if all seeds succeed
      await queryRunner.commitTransaction();
      this.logger.debug('All seeds executed successfully.');
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      this.logger.error(
        'Error during seeding, transaction rolled back:',
        error,
      );
    } finally {
      // Release the query runner and close the database connection
      await queryRunner.release();
      await this.dataSource.destroy();
      this.logger.debug('Seeder Database closed successfully.');
    }
  }
}

// Execute the seed runner
new SeedRunner(dataSource).run();
