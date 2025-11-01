import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ActivityLogEntity } from '../entities/activity-log.entity';
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
import { EmployeeEntity } from '../entities/employee.entity';
import { EduEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/edu';
import { WorkExpEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/workexp.entity';
import { ReferenceEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/reference.entity';
import { TrainingEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/training.entity';
import { WorkExpJobTitleEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/workexp-jobtitle.entity';
import { EmployeeMovementEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/employee-movement.entity';
import { EmployeeMovementTypeEntity } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/entities/employee-movement-type.entity';
import { DocumentTypeEntity } from '@features/document-management/infrastructure/database/typeorm/postgreSQL/entities/document-type.entity';
import { DocumentEntity } from '@features/document-management/infrastructure/database/typeorm/postgreSQL/entities/document.entity';
import { LeaveBalanceEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-balance.entity';
import { LeaveTypeEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-type.entity';
import { LeavePolicyEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-policy.entity';
import { LeaveCycleEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-cycle.entity';
import { LeaveRequestEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-request.entity';
import { LeaveTransactionEntity } from '@features/leave-management/infrastructure/database/typeorm/postgreSQL/entities/leave-transaction.entity';
import { HolidayEntity } from '../entities/holiday.entity';

export const getTypeormConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: configService.get<'postgres'>('DB_TYPE', 'postgres'),
  host: configService.get<string>('DB_HOST', '192.168.1.55'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'admin'),
  password: configService.get<string>('DB_PASSWORD', 'ytu55sw995rs'),
  database: configService.get<string>('DB_DATABASE', 'hris'),
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
  ],
  synchronize: false, // Disable in production
  logging: configService.get<boolean>('DB_LOGGING', false),
  extra: {
    timezone: '+08:00', // Force Manila timezone
  },
});
