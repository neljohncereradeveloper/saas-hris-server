import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { CityEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/city.entity';
import { CivilStatusEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/civilstatus.entity';
import { EduCourseLevelEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-courselevel.entity';
import { EduCourseEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-course.entity';
import { EduLevelEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-level.entity';
import { JobTitleEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/jobtitle.entity';
import { ReligionEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/religion.entity';
import { EduSchoolEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu-school.entity';
import { TrainingCertEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/training-cert.entity';
import { WorkExpCompanyEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/workexp-company.entity';
import { CitizenShipEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/citizenship.entity';
import { BarangayEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/barangay.entity';
import { ProvinceEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/province.entity';
import { BranchEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/branch.entity';
import { DeptEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/dept.entity';
import { EmpStatusEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/empstatus.entity';
import { EduEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu';
import { WorkExpEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/workexp.entity';
import { ReferenceEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/reference.entity';
import { TrainingEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/training.entity';
import { WorkExpJobTitleEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/workexp-jobtitle.entity';
import { ActivityLogEntity } from '../entities/activity-log.entity';
import { EmployeeEntity } from '../entities/employee.entity';
import { EmployeeMovementEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/employee-movement.entity';
import { EmployeeMovementTypeEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/employee-movement-type.entity';
import { DocumentTypeEntity } from '@features/document-management/infrastructure/database/typeorm/postgreSQL/entities/document-type.entity';
import { DocumentEntity } from '@features/document-management/infrastructure/database/typeorm/postgreSQL/entities/document.entity';
import { LeaveTypeEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-type.entity';
import { LeavePolicyEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-policy.entity';
import { LeaveBalanceEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-balance.entity';
import { LeaveCycleEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-cycle.entity';
import { LeaveRequestEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-request.entity';
import { LeaveTransactionEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-transaction.entity';
import { HolidayEntity } from '../entities/holiday.entity';

config();
const configService = new ConfigService();
export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: Number(configService.get('DB_PORT')),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [
    ActivityLogEntity,
    /** 201-files */
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
    /** document-management */
    DocumentTypeEntity,
    DocumentEntity,
    /** leave-management */
    LeaveTypeEntity,
    LeavePolicyEntity,
    LeaveBalanceEntity,
    LeaveCycleEntity,
    LeaveRequestEntity,
    LeaveTransactionEntity,
    /** shared-features */
    HolidayEntity,
  ], // this uses the compiled entites in the dist folder
  migrations: [
    'dist/src/features/shared/infrastructure/database/typeorm/postgresql/migrations/files/*.{ts,js}',
  ],
  logging: configService.get('NODE_ENV') === 'development',
  synchronize: false,
  extra: {
    timezone: '+08:00', // Force Manila timezone
  },
});
